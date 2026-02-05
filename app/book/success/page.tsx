'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase/client';
import type { Booking } from '@/types';

/* ─── shared shell ─────────────────────────────────────────────── */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @keyframes successFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ringPop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkDraw {
          0%   { stroke-dashoffset: 48; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes ringGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(230,179,30,0.35); }
          50%      { box-shadow: 0 0 24px 6px rgba(230,179,30,0.18); }
        }
      `}</style>
      <div style={{ background: '#0A0A0F', minHeight: '100vh', position: 'relative' }} className="flex flex-col items-center px-4 py-16 md:py-24">
        {/* grain */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
        }} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 680 }}>
          {children}
        </div>
      </div>
    </>
  );
}

/* ─── loading / error shells ───────────────────────────────────── */
function LoadingCard({ label = 'Loading…' }) {
  return (
    <PageShell>
      <div style={{
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '56px 32px',
        textAlign: 'center',
      }}>
        <div style={{ width: 36, height: 36, border: '2px solid #333', borderTop: '2px solid #E6B31E', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#6B6E75', fontSize: 14 }}>{label}</p>
      </div>
    </PageShell>
  );
}

/* ─── success content ──────────────────────────────────────────── */
function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bookingId = searchParams.get('booking_id');
    if (!bookingId) {
      router.push('/');
      return;
    }
    fetchBooking(bookingId);
  }, [searchParams, router]);

  const fetchBooking = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          slot:slots(*)
        `)
        .eq('id', bookingId)
        .single();

      if (error) throw error;
      setBooking(data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingCard label="Loading booking details…" />;

  if (!booking) {
    return (
      <PageShell>
        <div style={{
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16,
          padding: '48px 32px',
          textAlign: 'center',
        }}>
          <p style={{ color: '#6B6E75', fontSize: 14, marginBottom: 20 }}>Booking not found</p>
          <Link href="/">
            <button style={{
              padding: '12px 28px', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
              color: '#0A0A0F', fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'Montserrat, sans-serif',
            }}>
              Return Home
            </button>
          </Link>
        </div>
      </PageShell>
    );
  }

  /* ─── next-steps data ──────────────────────────────────────── */
  const nextSteps = [
    {
      title: 'Confirmation Email',
      desc: 'Check your inbox for booking details and a calendar invite.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2.003 5.884l7.997 5.998 7.997-5.998A2 2 0 0018 4H2a2 2 0 00-1.997 1.884zM2 6.118V14a2 2 0 002 2h12a2 2 0 002-2V6.118l-8 5.999-8-5.999z" />
        </svg>
      ),
    },
    {
      title: 'Pre-Arrival SMS',
      desc: '24 hours before, we send parking and preparation instructions.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M2 4.75A3.25 3.25 0 015.25 1.5h9.5A3.25 3.25 0 1818 4.75v6.5A3.25 3.25 0 0114.75 14.5h-7.69l-2.54 2.54a.75.75 0 01-1.21-.53v-2.46A3.25 3.25 0 012 11.25v-6.5z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      title: 'Service Day',
      desc: 'Our technician arrives on time with all professional equipment.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
        </svg>
      ),
    },
    {
      title: 'Digital Report',
      desc: 'After service, receive photos and a detailed health report via email.',
      icon: (
        <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A1 1 0 0111 2.586L13.414 5A1 1 0 0114 5.586V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm7 1h2.293L11 2.707V5z" clipRule="evenodd" />
        </svg>
      ),
    },
  ];

  return (
    <PageShell>
      {/* ── hero: animated checkmark ring ────────────────────── */}
      <div style={{ animation: 'successFadeUp 0.5s cubic-bezier(.22,1,.36,1) both', textAlign: 'center', marginBottom: 36 }}>
        {/* ring */}
        <div style={{
          width: 88, height: 88, borderRadius: '50%',
          border: '2px solid rgba(230,179,30,0.25)',
          background: 'rgba(230,179,30,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 22px',
          animation: 'ringPop 0.55s cubic-bezier(.22,1,.36,1) 0.1s both, ringGlow 2.4s ease-in-out 0.8s infinite',
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#E6B31E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: 'checkDraw 0.4s ease-out 0.5s forwards' }} />
          </svg>
        </div>

        <h1 style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 'clamp(1.7rem, 4.5vw, 2.6rem)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
          Booking Confirmed
        </h1>
        <p style={{ color: '#6B6E75', fontSize: 14, marginTop: 6 }}>Your vehicle preservation appointment is secured</p>
      </div>

      {/* ── booking details card ──────────────────────────────── */}
      <div style={{
        animation: 'successFadeUp 0.45s cubic-bezier(.22,1,.36,1) 150ms both',
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: '24px 28px 28px',
        marginBottom: 16,
      }}>
        {/* reference row */}
        <div className="flex items-center justify-between mb-5 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p style={{ color: '#4E5158', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 600, marginBottom: 4 }}>Booking Reference</p>
            <p style={{ color: '#E6B31E', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600, fontSize: 18, letterSpacing: '0.06em' }}>
              {booking.id.substring(0, 8).toUpperCase()}
            </p>
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 20,
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
            color: '#4ade80', fontSize: 13, fontWeight: 600,
          }}>
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Confirmed
          </span>
        </div>

        {/* detail grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
          {/* appointment */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span style={{ color: '#E6B31E' }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </span>
              <span style={{ color: '#8A8D94', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Appointment</span>
            </div>
            <p style={{ color: '#D4D6DB', fontSize: 14, fontWeight: 500 }}>{booking.slot?.saturday_date}</p>
            <p style={{ color: '#8A8D94', fontSize: 13, marginTop: 2 }}>{booking.slot?.time_slot?.substring(0, 5)}</p>
          </div>

          {/* vehicle */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span style={{ color: '#E6B31E' }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
              </span>
              <span style={{ color: '#8A8D94', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Vehicle</span>
            </div>
            <p style={{ color: '#D4D6DB', fontSize: 14, fontWeight: 500 }}>{booking.vehicle?.brand} {booking.vehicle?.model}</p>
            <p style={{ color: '#8A8D94', fontSize: 13, marginTop: 2 }}>{booking.vehicle?.license_plate}</p>
          </div>

          {/* location */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span style={{ color: '#E6B31E' }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </span>
              <span style={{ color: '#8A8D94', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Location</span>
            </div>
            <p style={{ color: '#D4D6DB', fontSize: 14, fontWeight: 500 }}>{booking.address}</p>
            <p style={{ color: '#8A8D94', fontSize: 13, marginTop: 2 }}>{booking.suburb}, {booking.city} {booking.postal_code}</p>
          </div>

          {/* service + total */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span style={{ color: '#E6B31E' }}>
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
              <span style={{ color: '#8A8D94', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Service</span>
            </div>
            <p style={{ color: '#D4D6DB', fontSize: 14, fontWeight: 500, textTransform: 'capitalize' }}>{booking.service_type.replace('_', ' ')}</p>
            <p style={{ color: '#E6B31E', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 17, marginTop: 4 }}>R{booking.grand_total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* ── what happens next ─────────────────────────────────── */}
      <div style={{
        animation: 'successFadeUp 0.45s cubic-bezier(.22,1,.36,1) 280ms both',
        background: 'rgba(255,255,255,0.025)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: '24px 28px 26px',
        marginBottom: 24,
      }}>
        <p style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 22 }}>
          What Happens Next
        </p>

        <div className="flex flex-col">
          {nextSteps.map((step, i) => (
            <div
              key={step.title}
              style={{ animation: `successFadeUp 0.4s cubic-bezier(.22,1,.36,1) ${340 + i * 80}ms both` }}
              className="flex gap-4"
            >
              {/* vertical timeline */}
              <div className="flex flex-col items-center" style={{ width: 36, flexShrink: 0 }}>
                {/* numbered circle */}
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i === 0 ? 'rgba(230,179,30,0.15)' : 'rgba(255,255,255,0.05)',
                  border: i === 0 ? '1px solid rgba(230,179,30,0.35)' : '1px solid rgba(255,255,255,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{
                    color: i === 0 ? '#E6B31E' : '#5A5D63',
                    fontSize: 13, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                  }}>{i + 1}</span>
                </div>
                {/* connector line */}
                {i < nextSteps.length - 1 && (
                  <div style={{ width: 1, flex: 1, background: 'rgba(255,255,255,0.07)', minHeight: 24 }} />
                )}
              </div>

              {/* text block */}
              <div style={{ paddingBottom: i < nextSteps.length - 1 ? 22 : 0, paddingTop: 2 }}>
                <p style={{ color: '#D4D6DB', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{step.title}</p>
                <p style={{ color: '#5A5D63', fontSize: 13, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── action buttons ────────────────────────────────────── */}
      <div
        style={{ animation: 'successFadeUp 0.45s cubic-bezier(.22,1,.36,1) 580ms both' }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        <Link href="/portal">
          <button style={{
            width: '100%', padding: '14px 0', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
            color: '#0A0A0F', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.04em',
            transition: 'transform 0.15s, box-shadow 0.2s',
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.transform = 'translateY(-1px)'; (e.target as HTMLElement).style.boxShadow = '0 4px 18px rgba(230,179,30,0.3)'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.transform = 'translateY(0)'; (e.target as HTMLElement).style.boxShadow = 'none'; }}
          >
            View in Portal
          </button>
        </Link>
        <Link href="/">
          <button style={{
            width: '100%', padding: '14px 0', borderRadius: 10,
            border: '1px solid rgba(255,255,255,0.12)', background: 'transparent',
            color: '#8A8D94', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em',
            transition: 'all 0.2s',
          }}
            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'rgba(230,179,30,0.4)'; (e.target as HTMLElement).style.color = '#E6B31E'; }}
            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.target as HTMLElement).style.color = '#8A8D94'; }}
          >
            Return Home
          </button>
        </Link>
      </div>
    </PageShell>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <SuccessContent />
    </Suspense>
  );
}
