'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Badge } from '@/components/shared';
import { supabase } from '@/lib/supabase/client';
import { getVehicleHealth } from '@/lib/health-algorithm';
import type { Vehicle, ServiceHistory } from '@/types';

export default function VehicleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const vehicleId = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [serviceHistory, setServiceHistory] = useState<ServiceHistory[]>([]);
  const [healthScore, setHealthScore] = useState(50);
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
    fetchData();
  };

  const fetchData = async () => {
    try {
      // Fetch vehicle
      const { data: vehicleData, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('id', vehicleId)
        .single();

      if (vehicleError) throw vehicleError;
      setVehicle(vehicleData);

      // Fetch vehicle health
      const health = await getVehicleHealth(vehicleId);
      setHealthScore(health?.health_score || 50);

      // Fetch service history
      const { data: historyData, error: historyError } = await supabase
        .from('service_history')
        .select(`
          *,
          booking:bookings(
            id,
            saturday_date,
            time_slot,
            service_type,
            status,
            grand_total
          )
        `)
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;
      setServiceHistory(historyData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthStatus = (score: number) => {
    if (score > 70) return { label: 'Excellent', color: 'success' };
    if (score > 40) return { label: 'Good', color: 'warning' };
    return { label: 'Fair', color: 'error' };
  };

  const getHealthColor = (score: number) => {
    if (score > 70) return '#22c55e';
    if (score > 40) return '#eab308';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center" style={{ background: '#07070A' }}>
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
          <p style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}>Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center" style={{ background: '#07070A' }}>
        <div
          className="p-12 text-center max-w-md"
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
          }}
        >
          <p className="mb-6" style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}>
            Vehicle not found
          </p>
          <Link href="/portal">
            <Button>Back to Garage</Button>
          </Link>
        </div>
      </div>
    );
  }

  const healthStatus = getHealthStatus(healthScore);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4" style={{ background: '#07070A' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/portal">
            <button
              className="flex items-center gap-2 mb-6 transition-all duration-300"
              style={{
                color: '#E6B31E',
                fontFamily: 'Montserrat, sans-serif',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.7';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <span>←</span> Back to Garage
            </button>
          </Link>
        </div>

        {/* Vehicle Info Card */}
        <div
          className="p-8 mb-8"
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
          }}
        >
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <h1
                className="text-4xl font-bold mb-2"
                style={{
                  color: '#F0F0F3',
                  fontFamily: 'Montserrat, sans-serif',
                  letterSpacing: '-0.02em',
                }}
              >
                {vehicle.brand} {vehicle.model}
              </h1>
              <p
                className="text-xl mb-8"
                style={{
                  color: '#D4D6DB',
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 500,
                  letterSpacing: '0.05em',
                }}
              >
                {vehicle.license_plate}
              </p>

              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Year', value: vehicle.year || 'N/A' },
                  { label: 'Color', value: vehicle.color || 'N/A' },
                  { label: 'Category', value: vehicle.size_category, capitalize: true },
                ].map((item, idx) => (
                  <div key={idx}>
                    <p
                      className="text-sm mb-2"
                      style={{
                        color: '#6B6E75',
                        fontFamily: 'Montserrat, sans-serif',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      {item.label}
                    </p>
                    <p
                      className="text-lg font-semibold"
                      style={{
                        color: '#F0F0F3',
                        fontFamily: 'Montserrat, sans-serif',
                        textTransform: item.capitalize ? 'capitalize' : 'none',
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Score Circle */}
            <div className="w-full md:w-80">
              <div className="text-center">
                <p
                  className="text-sm mb-4"
                  style={{
                    color: '#6B6E75',
                    fontFamily: 'Montserrat, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Protection Health
                </p>
                <div className="relative w-40 h-40 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="rgba(255,255,255,0.08)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={getHealthColor(healthScore)}
                      strokeWidth="8"
                      strokeDasharray={`${(healthScore / 100) * 283} 283`}
                      style={{
                        transition: 'stroke-dasharray 1s ease-in-out',
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                      className="text-5xl font-bold mb-1"
                      style={{
                        color: '#E6B31E',
                        fontFamily: 'Montserrat, sans-serif',
                      }}
                    >
                      {healthScore}%
                    </span>
                    <span
                      className="text-xs"
                      style={{
                        color: '#D4D6DB',
                        fontFamily: 'Montserrat, sans-serif',
                      }}
                    >
                      {healthStatus.label}
                    </span>
                  </div>
                </div>
                <div
                  className="px-4 py-2 rounded-full inline-block"
                  style={{
                    background:
                      healthScore > 70
                        ? 'rgba(34,197,94,0.15)'
                        : healthScore > 40
                        ? 'rgba(234,179,8,0.15)'
                        : 'rgba(239,68,68,0.15)',
                    color: getHealthColor(healthScore),
                    fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  {healthStatus.label} Protection
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Health Info & CTA */}
        <div
          className="p-6 mb-8"
          style={{
            background: 'rgba(230,179,30,0.05)',
            border: '1px solid rgba(230,179,30,0.2)',
            borderRadius: '18px',
          }}
        >
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 mt-0.5" fill="#E6B31E" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p
                className="text-sm mb-4"
                style={{
                  color: '#D4D6DB',
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: '1.6',
                }}
              >
                <strong>Note:</strong> Protection health is an <em>estimation</em> based on days since last service. Actual vehicle condition may vary depending on environmental factors (weather, UV exposure, salt air) and usage patterns.
              </p>
              <p
                style={{
                  color: '#D4D6DB',
                  fontFamily: 'Montserrat, sans-serif',
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                }}
              >
                Regular preservation services help maintain optimal condition.
              </p>
            </div>
          </div>
          <Link href="/book">
            <button
              className="w-full py-4 rounded-xl font-bold tracking-wide uppercase transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                color: '#0A0A0F',
                fontSize: '0.875rem',
                fontFamily: 'Montserrat, sans-serif',
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
              Book New Service
            </button>
          </Link>
        </div>

        {/* Service History */}
        <div>
          <h2
            className="text-2xl font-bold mb-6"
            style={{
              color: '#F0F0F3',
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            Service History
          </h2>

          {serviceHistory.length === 0 ? (
            <div
              className="p-12 text-center"
              style={{
                background: 'rgba(255,255,255,0.035)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '18px',
              }}
            >
              <p className="mb-6" style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}>
                No services completed yet
              </p>
              <Link href="/book">
                <button
                  className="px-6 py-3 rounded-xl font-bold tracking-wide uppercase transition-all duration-300"
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
            <div className="space-y-4">
              {serviceHistory.map((history) => (
                <div
                  key={history.id}
                  className="p-6 transition-all duration-300"
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
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3
                          className="text-lg font-bold"
                          style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif' }}
                        >
                          Service Completed
                        </h3>
                        <Badge variant="success">Completed</Badge>
                      </div>
                      <div
                        className="space-y-2 text-sm"
                        style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}
                      >
                        <p>
                          <span style={{ color: '#6B6E75' }}>Date:</span>{' '}
                          {new Date(history.created_at).toLocaleDateString()}
                        </p>
                        {history.booking && (
                          <>
                            <p>
                              <span style={{ color: '#6B6E75' }}>Service Type:</span>{' '}
                              <span className="capitalize">{history.booking.service_type.replace('_', ' ')}</span>
                            </p>
                            <p>
                              <span style={{ color: '#6B6E75' }}>Cost:</span>{' '}
                              <span style={{ color: '#E6B31E', fontWeight: 600 }}>
                                R{history.booking.grand_total.toFixed(2)}
                              </span>
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    {(history.before_photos?.length || history.after_photos?.length) ? (
                      <div className="flex gap-2 flex-wrap">
                        {history.before_photos?.[0] && (
                          <a href={history.before_photos[0]} target="_blank" rel="noopener noreferrer">
                            <button
                              className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
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
                              Before Photo
                            </button>
                          </a>
                        )}
                        {history.after_photos?.[0] && (
                          <a href={history.after_photos[0]} target="_blank" rel="noopener noreferrer">
                            <button
                              className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
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
                              After Photo
                            </button>
                          </a>
                        )}
                      </div>
                    ) : (
                      <span
                        className="text-sm"
                        style={{ color: '#6B6E75', fontFamily: 'Montserrat, sans-serif' }}
                      >
                        No photos available
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
