'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Badge } from '@/components/shared';
import { supabase } from '@/lib/supabase/client';
import type { Booking, ServiceHistory } from '@/types';

interface BookingWithRelations extends Booking {
  vehicle: any;
  slot: any;
  service_history: ServiceHistory | null;
}

export default function BookingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<BookingWithRelations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (!authUser) {
      router.push('/auth/login');
      return;
    }
    fetchBooking();
  };

  const fetchBooking = async () => {
    try {
      const { data: bookingData, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          slot:slots(*),
          service_history(*)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(bookingData);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'info';
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

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
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
          <p style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
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
            Booking not found
          </p>
          <Link href="/portal">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const serviceHistory = Array.isArray(booking.service_history)
    ? booking.service_history[0]
    : booking.service_history;

  return (
    <div className="min-h-screen pt-32 pb-20 px-4" style={{ background: '#07070A' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <Link href="/portal">
            <button
              className="flex items-center gap-2 transition-all duration-300"
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
              <span>←</span> Back to Dashboard
            </button>
          </Link>
          <Badge variant={getStatusColor(booking.status) as any}>
            {getStatusLabel(booking.status)}
          </Badge>
        </div>

        {/* Booking Title */}
        <div className="mb-8">
          <h1
            className="text-4xl font-bold mb-2"
            style={{
              color: '#F0F0F3',
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            Booking #{booking.id.substring(0, 8).toUpperCase()}
          </h1>
          <p style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}>
            Created {new Date(booking.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-6">
          {/* Vehicle Details */}
          <div
            className="p-8"
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
            }}
          >
            <h2
              className="text-xl font-bold mb-6 pb-4"
              style={{
                color: '#F0F0F3',
                fontFamily: 'Montserrat, sans-serif',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Vehicle Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Vehicle', value: `${booking.vehicle?.brand} ${booking.vehicle?.model}` },
                { label: 'License Plate', value: booking.vehicle?.license_plate },
                { label: 'Category', value: booking.vehicle?.size_category, capitalize: true },
                { label: 'Color', value: booking.vehicle?.color || 'Not specified' },
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
            {booking.vehicle?.id && (
              <Link href={`/portal/vehicle/${booking.vehicle.id}`}>
                <button
                  className="mt-6 px-4 py-2 rounded-lg font-semibold transition-all duration-300"
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
                  View Vehicle Details
                </button>
              </Link>
            )}
          </div>

          {/* Service Details */}
          <div
            className="p-8"
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
            }}
          >
            <h2
              className="text-xl font-bold mb-6 pb-4"
              style={{
                color: '#F0F0F3',
                fontFamily: 'Montserrat, sans-serif',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Service Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Service Type', value: booking.service_type.replace('_', ' '), capitalize: true },
                { label: 'Scheduled Date', value: booking.slot?.saturday_date },
                { label: 'Time Slot', value: booking.slot?.time_slot },
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

          {/* Service Location */}
          <div
            className="p-8"
            style={{
              background: 'rgba(255,255,255,0.035)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '18px',
            }}
          >
            <h2
              className="text-xl font-bold mb-6 pb-4"
              style={{
                color: '#F0F0F3',
                fontFamily: 'Montserrat, sans-serif',
                borderBottom: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              Service Location
            </h2>
            <div
              className="space-y-3"
              style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}
            >
              <p>{booking.address}</p>
              <p>
                {booking.suburb}, {booking.city} {booking.postal_code}
              </p>
              {booking.gate_access_notes && (
                <div className="pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                  <p className="text-sm mb-1" style={{ color: '#6B6E75' }}>
                    Gate Access Notes:
                  </p>
                  <p className="italic">{booking.gate_access_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Service History (if completed) */}
          {serviceHistory && (
            <div
              className="p-8"
              style={{
                background: 'rgba(34,197,94,0.05)',
                border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '18px',
              }}
            >
              <h2
                className="text-xl font-bold mb-6 pb-4"
                style={{
                  color: '#F0F0F3',
                  fontFamily: 'Montserrat, sans-serif',
                  borderBottom: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                Service Completion Report
              </h2>
              <div
                className="space-y-3 text-sm mb-6"
                style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}
              >
                <p>
                  <span style={{ color: '#6B6E75' }}>Completed:</span>{' '}
                  {new Date(serviceHistory.completed_at).toLocaleDateString()}
                </p>
                {serviceHistory.paint_condition && (
                  <p>
                    <span style={{ color: '#6B6E75' }}>Paint Condition:</span>{' '}
                    <span className="capitalize">{serviceHistory.paint_condition}</span>
                  </p>
                )}
                {serviceHistory.technician_notes && (
                  <div>
                    <p style={{ color: '#6B6E75' }} className="mb-1">
                      Technician Notes:
                    </p>
                    <p className="italic">{serviceHistory.technician_notes}</p>
                  </div>
                )}
              </div>
              {(serviceHistory.before_photos?.length || serviceHistory.after_photos?.length) && (
                <div className="flex gap-3 flex-wrap">
                  {serviceHistory.before_photos?.map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                      <button
                        className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: '#22c55e',
                          border: '1px solid rgba(34,197,94,0.3)',
                          fontSize: '0.875rem',
                          fontFamily: 'Montserrat, sans-serif',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(34,197,94,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }}
                      >
                        Before Photo {idx + 1}
                      </button>
                    </a>
                  ))}
                  {serviceHistory.after_photos?.map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                      <button
                        className="px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                        style={{
                          background: 'rgba(255,255,255,0.05)',
                          color: '#22c55e',
                          border: '1px solid rgba(34,197,94,0.3)',
                          fontSize: '0.875rem',
                          fontFamily: 'Montserrat, sans-serif',
                          cursor: 'pointer',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(34,197,94,0.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                        }}
                      >
                        After Photo {idx + 1}
                      </button>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Price Summary */}
          <div
            className="p-8"
            style={{
              background: 'linear-gradient(135deg, rgba(230,179,30,0.1) 0%, rgba(230,179,30,0.03) 100%)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(230,179,30,0.3)',
              borderRadius: '18px',
            }}
          >
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif' }}
            >
              Payment Summary
            </h2>
            <div className="space-y-4 mb-6">
              {[
                { label: 'Base Service', amount: booking.base_price },
                ...(booking.addon_price && booking.addon_price > 0
                  ? [{ label: 'Add-ons', amount: booking.addon_price }]
                  : []),
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between"
                  style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}
                >
                  <span>{item.label}</span>
                  <span>R{item.amount.toFixed(2)}</span>
                </div>
              ))}
              <div
                className="flex justify-between pt-4"
                style={{
                  color: '#D4D6DB',
                  fontFamily: 'Montserrat, sans-serif',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <span>Subtotal</span>
                <span>R{booking.total_price.toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between"
                style={{ color: '#6B6E75', fontFamily: 'Montserrat, sans-serif' }}
              >
                <span>VAT (15%)</span>
                <span>R{booking.vat_amount.toFixed(2)}</span>
              </div>
              <div
                className="flex justify-between text-2xl font-bold pt-4"
                style={{
                  borderTop: '2px solid rgba(230,179,30,0.5)',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                <span style={{ color: '#F0F0F3' }}>Total Paid</span>
                <span
                  style={{
                    background: 'linear-gradient(135deg, #E6B31E 0%, #FFD700 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  R{booking.grand_total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
