'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { DynamicCheckout, CheckoutDataSchema } from '@/components/reusable/checkout/DynamicCheckout';
import { PaystackAdapter } from '@/components/reusable/checkout/adapters/PaystackAdapter';

/* ─── shared shell ─────────────────────────────────────────────── */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @keyframes checkoutFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
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

/* ─── spinner card ─────────────────────────────────────────────── */
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

/* ─── main content ─────────────────────────────────────────────── */
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');

  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!bookingId) {
        router.push('/book');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/book/auth');
        return;
      }
      setUserEmail(user.email || '');

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          vehicle:vehicles(*),
          booking_addons(
             service_addons(*)
          ),
          slot:slots(time_slot, saturday_date)
        `)
        .eq('id', bookingId)
        .single();

      if (error || !data) {
        console.error('Fetch error:', error);
        alert('Could not find booking');
        router.push('/book');
        return;
      }

      setBooking(data);
      setLoading(false);
    };

    fetchData();
  }, [bookingId, router]);

  if (loading || !booking) {
    return <LoadingCard label="Loading booking details…" />;
  }

  const paystackAdapter = new PaystackAdapter({
      publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!
  });

  const dataSchema: CheckoutDataSchema = {
      sections: [
          {
              title: 'Vehicle Details',
              fields: [
                  { label: 'Vehicle', value: `${booking.vehicle?.brand} ${booking.vehicle?.model}` },
                  { label: 'License Plate', value: booking.vehicle?.license_plate },
                  { label: 'Color', value: booking.vehicle?.color }
              ]
          },
          {
              title: 'Service Details',
              fields: [
                  { label: 'Service Date', value: booking.slot?.saturday_date },
                  { label: 'Time', value: booking.slot?.time_slot },
                  { label: 'Service Type', value: booking.service_type },
                  { label: 'Location', value: `${booking.suburb}, ${booking.city}` }
              ]
          }
      ]
  };

  return (
    <PageShell>
      {/* header */}
      <div style={{ animation: 'checkoutFadeUp 0.45s cubic-bezier(.22,1,.36,1) both', textAlign: 'center', marginBottom: 32 }}>
        <p style={{ color: '#E6B31E', letterSpacing: '0.2em', fontSize: 11, textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, marginBottom: 10 }}>
          Final Step
        </p>
        <h1 style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', letterSpacing: '-0.03em' }}>
          Secure Checkout
        </h1>
        <p style={{ color: '#6B6E75', fontSize: 14, marginTop: 6 }}>Complete your payment to confirm the booking</p>
      </div>

      {/* DynamicCheckout — styling is owned by that component; we only control the wrapper */}
      <div style={{ animation: 'checkoutFadeUp 0.45s cubic-bezier(.22,1,.36,1) 100ms both' }}>
        <DynamicCheckout
            config={{
                paymentProvider: 'paystack',
                paymentAdapter: paystackAdapter,
                bookingData: booking,
                bookingId: booking.id,
                userEmail: userEmail,
                dataSchema: dataSchema,
                pricingCalculator: (data) => ({
                    base: data.base_price,
                    addons: data.addon_price,
                    subtotal: data.total_price,
                    tax: data.vat_amount,
                    total: data.grand_total
                }),
                currency: 'ZAR',
                verifyEndpoint: '/api/bookings/verify',
                requireAuthentication: true,
                onSuccess: (id) => {
                    router.push(`/book/success?booking_id=${id}`);
                },
                onError: (err) => {
                    alert(err.message);
                }
            }}
        />
      </div>
    </PageShell>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<LoadingCard />}>
      <CheckoutContent />
    </Suspense>
  );
}
