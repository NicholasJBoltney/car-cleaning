'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/shared';
import { supabase } from '@/lib/supabase/client';
import { getVehicleHealth } from '@/lib/health-algorithm';
import { getReferralStats } from '@/lib/referrals';
import type { Vehicle, Booking } from '@/types';

export default function PortalPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicleHealthMap, setVehicleHealthMap] = useState<Record<string, number>>({});
  const [referralCredits, setReferralCredits] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    fetchData(user.id);
  };

  const fetchData = async (userId: string) => {
    try {
      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (vehiclesError) throw vehiclesError;
      setVehicles(vehiclesData || []);

      // Fetch health scores for all vehicles
      const healthMap: Record<string, number> = {};
      for (const vehicle of vehiclesData || []) {
        const health = await getVehicleHealth(vehicle.id);
        healthMap[vehicle.id] = health?.health_score || 50;
      }
      setVehicleHealthMap(healthMap);

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          slot:slots(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (bookingsError) throw bookingsError;
      setBookings(bookingsData || []);

      // Fetch referral credits
      const referralData = await getReferralStats(userId);
      setReferralCredits(referralData?.creditsBalance || 0);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateHealthScore = (vehicleId: string) => {
    return vehicleHealthMap[vehicleId] || 50;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getHealthColor = (score: number) => {
    if (score > 70) return 'linear-gradient(135deg, #E6B31E 0%, #FFD700 100%)';
    if (score > 40) return 'linear-gradient(135deg, #d4a017 0%, #E6B31E 100%)';
    return 'linear-gradient(135deg, #6B6E75 0%, #8B8E95 100%)';
  };

  // Calculate dashboard stats
  const completedServices = bookings.filter((b) => b.status === 'completed').length;
  const upcomingServices = bookings.filter((b) => b.status === 'confirmed').length;
  const nextService = bookings.find((b) => b.status === 'confirmed');
  const avgHealthScore = vehicles.length > 0
    ? Math.round(vehicles.reduce((sum, v) => sum + calculateHealthScore(v.id), 0) / vehicles.length)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex items-center justify-center" style={{ background: '#07070A' }}>
        <div
          className="p-12 text-center"
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
          }}
        >
          <div
            className="animate-spin h-12 w-12 rounded-full mx-auto mb-4"
            style={{
              border: '4px solid rgba(230,179,30,0.2)',
              borderTopColor: '#E6B31E',
            }}
          />
          <p style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}>Loading your garage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 lg:px-8 flex items-center justify-center" style={{ background: '#07070A', width: '100%' }}>
      <div className="max-w-4xl w-full">
        {/* In Development Banner */}
        <div
          className="p-12 lg:p-16 text-center transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(230,179,30,0.1) 0%, rgba(230,179,30,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '2px solid rgba(230,179,30,0.3)',
            borderRadius: '18px',
            boxShadow: '0 8px 32px rgba(230,179,30,0.2)',
          }}
        >
          <h2
            className="text-3xl lg:text-4xl font-bold mb-4"
            style={{
              background: 'linear-gradient(135deg, #E6B31E 0%, #FFD700 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Currently In Development
          </h2>
          <p
            className="text-lg max-w-2xl mx-auto"
            style={{
              color: '#D4D6DB',
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: '1.7',
            }}
          >
            We're crafting an exceptional client experience. The portal will be launching soon with advanced vehicle tracking, service history, and exclusive member benefits.
          </p>
        </div>

        {/* TEMPORARILY HIDDEN - Change false to true when ready to launch */}
        {false && (
          <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-20">
          {[
            { label: 'Total Vehicles', value: vehicles.length },
            { label: 'Avg Health', value: `${avgHealthScore}%` },
            { label: 'Completed', value: completedServices },
            { label: 'Upcoming', value: upcomingServices },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-8 transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(230,179,30,0.3)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <p
                className="text-sm mb-3"
                style={{
                  color: '#6B6E75',
                  fontFamily: 'Montserrat, sans-serif',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 500,
                }}
              >
                {stat.label}
              </p>
              <p
                className="text-4xl lg:text-5xl font-bold"
                style={{
                  color: '#E6B31E',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Referral Credits Banner */}
        {referralCredits > 0 && (
          <div
            className="p-8 lg:p-10 mb-20 transition-all duration-300"
            style={{
              background: 'linear-gradient(135deg, rgba(230,179,30,0.15) 0%, rgba(230,179,30,0.05) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(230,179,30,0.4)',
              borderRadius: '18px',
              boxShadow: '0 8px 32px rgba(230,179,30,0.15)',
            }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              <div>
                <p
                  className="text-sm mb-2"
                  style={{
                    color: '#D4D6DB',
                    fontFamily: 'Montserrat, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 500,
                  }}
                >
                  Available Credits
                </p>
                <p
                  className="text-4xl lg:text-5xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #E6B31E 0%, #FFD700 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  R{referralCredits.toFixed(2)}
                </p>
              </div>
              <Link href="/portal/referrals">
                <button
                  className="px-8 py-4 rounded-xl font-semibold tracking-wide uppercase transition-all duration-300 whitespace-nowrap"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    color: '#E6B31E',
                    border: '1px solid rgba(230,179,30,0.4)',
                    fontSize: '0.875rem',
                    fontFamily: 'Montserrat, sans-serif',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(230,179,30,0.2)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  View Referrals
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Next Service Alert */}
        {nextService && (
          <div
            className="p-8 mb-20 transition-all duration-300"
            style={{
              background: 'rgba(230,179,30,0.05)',
              border: '1px solid rgba(230,179,30,0.2)',
              borderRadius: '18px',
            }}
          >
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex-1">
                <p
                  className="text-sm mb-2"
                  style={{
                    color: '#6B6E75',
                    fontFamily: 'Montserrat, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 500,
                  }}
                >
                  Upcoming Service
                </p>
                <h3
                  className="text-xl lg:text-2xl font-bold mb-2"
                  style={{
                    color: '#F0F0F3',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {nextService!.vehicle?.brand} {nextService!.vehicle?.model}
                </h3>
                <p
                  style={{
                    color: '#D4D6DB',
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {nextService!.slot?.saturday_date ? new Date(nextService!.slot!.saturday_date).toLocaleDateString('en-ZA', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }) : ''}{' '}
                  at {nextService!.slot?.time_slot?.substring(0, 5) || ''}
                </p>
              </div>
              <Link href={`/portal/booking/${nextService!.id}`}>
                <button
                  className="px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                  style={{
                    background: 'rgba(230,179,30,0.15)',
                    color: '#E6B31E',
                    border: '1px solid rgba(230,179,30,0.3)',
                    fontSize: '0.875rem',
                    fontFamily: 'Montserrat, sans-serif',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(230,179,30,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(230,179,30,0.15)';
                  }}
                >
                  View Details
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-20">
          <Link href="/book">
            <button
              className="w-full p-8 rounded-xl font-bold text-left transition-all duration-300 group"
              style={{
                background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                color: '#0A0A0F',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(230,179,30,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,179,30,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,179,30,0.3)';
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-2xl lg:text-3xl font-bold mb-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Book New Service
                  </p>
                  <p
                    className="text-sm opacity-80"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Schedule your next preservation
                  </p>
                </div>
                <span
                  className="text-4xl transition-transform duration-300 group-hover:translate-x-2"
                  style={{ display: 'inline-block' }}
                >
                  →
                </span>
              </div>
            </button>
          </Link>
          <Link href="/portal/referrals">
            <button
              className="w-full p-8 rounded-xl font-bold text-left transition-all duration-300 group"
              style={{
                background: 'rgba(255,255,255,0.035)',
                color: '#E6B31E',
                border: '1px solid rgba(230,179,30,0.3)',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(230,179,30,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.035)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p
                    className="text-2xl lg:text-3xl font-bold mb-2"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Earn Rewards
                  </p>
                  <p
                    className="text-sm"
                    style={{ fontFamily: 'Montserrat, sans-serif', color: '#D4D6DB' }}
                  >
                    Refer friends and earn credits
                  </p>
                </div>
                <span
                  className="text-4xl transition-transform duration-300 group-hover:translate-x-2"
                  style={{ display: 'inline-block' }}
                >
                  →
                </span>
              </div>
            </button>
          </Link>
        </div>

        {/* Divider */}
        <div
          className="mb-16"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(230,179,30,0.2), transparent)',
          }}
        />

        {/* Fleet Section */}
        <div className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-3xl lg:text-4xl font-bold"
              style={{
                color: '#F0F0F3',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '-0.01em',
              }}
            >
              Your Fleet
            </h2>
            {vehicles.length > 0 && (
              <span
                className="text-sm px-4 py-2 rounded-full"
                style={{
                  color: '#E6B31E',
                  fontFamily: 'Montserrat, sans-serif',
                  background: 'rgba(230,179,30,0.1)',
                  border: '1px solid rgba(230,179,30,0.2)',
                }}
              >
                {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'}
              </span>
            )}
          </div>

          {vehicles.length === 0 ? (
            <div
              className="p-20 text-center"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
              }}
            >
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif' }}
              >
                No Vehicles Yet
              </h3>
              <p className="mb-8 max-w-md mx-auto" style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif', lineHeight: '1.7' }}>
                Add your first vehicle to start tracking its preservation health and service history
              </p>
              <Link href="/book">
                <button
                  className="px-8 py-4 rounded-xl font-bold tracking-wide uppercase transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                    color: '#0A0A0F',
                    fontSize: '0.875rem',
                    fontFamily: 'Montserrat, sans-serif',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(230,179,30,0.3)',
                  }}
                >
                  Add Your First Vehicle
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {vehicles.map((vehicle) => {
                const healthScore = calculateHealthScore(vehicle.id);
                const lastBooking = bookings.find(
                  (b) => b.vehicle_id === vehicle.id && b.status === 'completed'
                );

                return (
                  <Link key={vehicle.id} href={`/portal/vehicle/${vehicle.id}`}>
                    <div
                      className="p-8 cursor-pointer transition-all duration-300 h-full"
                      style={{
                        background: 'rgba(255,255,255,0.035)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '18px',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(230,179,30,0.3)';
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 8px 32px rgba(230,179,30,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      {/* Vehicle Header */}
                      <div className="mb-6">
                        <h3
                          className="text-2xl font-bold mb-2"
                          style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {vehicle.brand}
                        </h3>
                        <p
                          className="text-lg mb-3"
                          style={{
                            color: '#D4D6DB',
                            fontFamily: 'Montserrat, sans-serif',
                          }}
                        >
                          {vehicle.model}
                        </p>
                        <p
                          className="text-sm"
                          style={{
                            color: '#6B6E75',
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 500,
                            letterSpacing: '0.05em',
                          }}
                        >
                          {vehicle.license_plate}
                        </p>
                      </div>

                      {/* Health Score Visualization */}
                      <div
                        className="mb-6 p-6 rounded-xl"
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span
                            className="text-xs"
                            style={{
                              color: '#6B6E75',
                              fontFamily: 'Montserrat, sans-serif',
                              textTransform: 'uppercase',
                              letterSpacing: '0.1em',
                            }}
                          >
                            Protection Health
                          </span>
                          <span
                            className="text-3xl font-bold"
                            style={{
                              background: getHealthColor(healthScore),
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                              fontFamily: 'Montserrat, sans-serif',
                            }}
                          >
                            {healthScore}%
                          </span>
                        </div>
                        <div
                          className="w-full h-2 rounded-full overflow-hidden"
                          style={{ background: 'rgba(255,255,255,0.08)' }}
                        >
                          <div
                            className="h-full transition-all duration-1000"
                            style={{
                              width: `${healthScore}%`,
                              background: getHealthColor(healthScore),
                            }}
                          />
                        </div>
                      </div>

                      {/* Last Service */}
                      <div
                        className="pt-6"
                        style={{
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                        }}
                      >
                        <div className="flex items-center justify-between text-sm">
                          <span
                            style={{
                              color: '#6B6E75',
                              fontFamily: 'Montserrat, sans-serif',
                            }}
                          >
                            {lastBooking ? 'Last Service' : 'No Service Yet'}
                          </span>
                          {lastBooking && (
                            <span
                              style={{
                                color: '#E6B31E',
                                fontFamily: 'Montserrat, sans-serif',
                                fontWeight: 600,
                              }}
                            >
                              {new Date(lastBooking.updated_at).toLocaleDateString('en-ZA', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Divider */}
        <div
          className="mb-16"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(230,179,30,0.2), transparent)',
          }}
        />

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2
              className="text-3xl lg:text-4xl font-bold"
              style={{
                color: '#F0F0F3',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '-0.01em',
              }}
            >
              Recent Activity
            </h2>
            {bookings.length > 3 && (
              <span
                className="text-sm"
                style={{
                  color: '#6B6E75',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                Showing latest 3
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <div
              className="p-20 text-center"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
              }}
            >
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif' }}
              >
                No Bookings Yet
              </h3>
              <p className="mb-8 max-w-md mx-auto" style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif', lineHeight: '1.7' }}>
                Book your first preservation service to get started
              </p>
              <Link href="/book">
                <button
                  className="px-8 py-4 rounded-xl font-bold tracking-wide uppercase transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                    color: '#0A0A0F',
                    fontSize: '0.875rem',
                    fontFamily: 'Montserrat, sans-serif',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(230,179,30,0.3)',
                  }}
                >
                  Book Your First Service
                </button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {bookings.slice(0, 3).map((booking) => (
                <div
                  key={booking.id}
                  className="p-8 cursor-pointer transition-all duration-300"
                  style={{
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '18px',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(230,179,30,0.3)';
                    e.currentTarget.style.boxShadow = '0 4px 24px rgba(230,179,30,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h3
                          className="text-xl font-bold"
                          style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {booking.vehicle?.brand} {booking.vehicle?.model}
                        </h3>
                        <Badge variant={getStatusColor(booking.status) as any}>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                        <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <span style={{ color: '#6B6E75' }}>Date:</span>{' '}
                          <span style={{ color: '#D4D6DB' }}>
                            {booking.slot?.saturday_date && new Date(booking.slot.saturday_date).toLocaleDateString('en-ZA', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <span style={{ color: '#6B6E75' }}>Time:</span>{' '}
                          <span style={{ color: '#D4D6DB' }}>
                            {booking.slot?.time_slot?.substring(0, 5)}
                          </span>
                        </div>
                        <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <span style={{ color: '#6B6E75' }}>Service:</span>{' '}
                          <span className="capitalize" style={{ color: '#D4D6DB' }}>
                            {booking.service_type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p
                          className="text-sm mb-1"
                          style={{ color: '#6B6E75', fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Total
                        </p>
                        <p
                          className="text-2xl font-bold"
                          style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif' }}
                        >
                          R{booking.grand_total.toFixed(2)}
                        </p>
                      </div>
                      <Link href={`/portal/booking/${booking.id}`}>
                        <button
                          className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap"
                          style={{
                            background: 'rgba(255,255,255,0.05)',
                            color: '#E6B31E',
                            border: '1px solid rgba(230,179,30,0.3)',
                            fontSize: '0.875rem',
                            fontFamily: 'Montserrat, sans-serif',
                            cursor: 'pointer',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(230,179,30,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                          }}
                        >
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
          </>
        )}
        {/* END TEMPORARILY HIDDEN */}
      </div>
    </div>
  );
}
