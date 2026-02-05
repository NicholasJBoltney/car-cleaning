'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, getAccessToken } from '@/lib/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Stepper } from '@/components/booking/Stepper';
import { Step1Vehicle } from '@/components/booking/Step1Vehicle';
import { Step2Schedule } from '@/components/booking/Step2Schedule';
import { Step3Service } from '@/components/booking/Step3Service';
import { Step4Location } from '@/components/booking/Step4Location';
import { Button } from '@/components/shared';
import type { BookingFormData } from '@/types';

const STEPS = ['Vehicle', 'Schedule', 'Service', 'Location'];

/* ─── micro-animation helpers ─────────────────────────────────── */
const fadeUp = {
  animation: 'bookingFadeUp 0.45s cubic-bezier(.22,1,.36,1) both',
} as const;

const staggerDelay = (i: number) => ({
  ...fadeUp,
  animationDelay: `${i * 90}ms`,
});

export default function BookingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BookingFormData>>({});
  const [showReview, setShowReview] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/book/auth');
      } else {
        setSession(session);
        setFormData(prev => ({
          ...prev,
          email: session.user.email,
          first_name: session.user.user_metadata?.first_name,
          phone: session.user.user_metadata?.phone,
          last_name: session.user.user_metadata?.last_name
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
           router.push('/book/auth');
        }
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (!session && currentStep === 1) {
    return (
      <div style={{ background: '#0A0A0F' }} className="min-h-screen flex items-center justify-center">
        <div style={{ width: 40, height: 40, border: '2px solid #333', borderTop: '2px solid #E6B31E', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    );
  }

  const handleStepComplete = (stepData: any) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      const basePrice = stepData.base_price || formData.base_price || 0;
      const addonPrice = stepData.addon_price || formData.addon_price || 0;
      const totalPrice = basePrice + addonPrice;
      const vatAmount = totalPrice * 0.15;
      const grandTotal = totalPrice + vatAmount;

      setFormData((prev) => ({
        ...prev,
        ...stepData,
        total_price: totalPrice,
        vat_amount: vatAmount,
        grand_total: grandTotal,
      }));
      setShowReview(true);
    }
  };

  const handleBack = () => {
    if (showReview) {
      setShowReview(false);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleProceedToPayment = async () => {
    setIsSubmitting(true);
    setBookingError(null);
    try {
      const token = await getAccessToken();
      if (!token || !session?.user) {
        router.push('/book/auth');
        return;
      }

      const payload = {
        user_id: session.user.id,
        vehicle_data: {
            brand: formData.new_vehicle?.brand,
            model: formData.new_vehicle?.model,
            license_plate: formData.new_vehicle?.license_plate,
            size_category: formData.new_vehicle?.size_category
        },
        booking_data: {
           saturday_date: formData.saturday_date,
           time_slot: formData.time_slot,
           service_type: formData.service_type,
           address: formData.address,
           suburb: formData.suburb,
           city: formData.city,
           postal_code: formData.postal_code,
           gate_access_notes: formData.gate_access_notes,
           special_requests: formData.special_requests,
        },
        addon_ids: formData.selected_addons || []
      };

      const res = await fetch('/api/bookings/create', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${token}`
           },
           body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Booking failed');
      }

      router.push(`/book/checkout?booking_id=${data.booking_id}`);

    } catch (error: any) {
        console.error(error);
        setBookingError(error.message || 'Booking failed');
    } finally {
        setIsSubmitting(false);
    }
  };

  /* ─── REVIEW SCREEN ─────────────────────────────────────────── */
  if (showReview) {
    const sections = [
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        ),
        title: 'Vehicle',
        rows: [
          { label: 'Brand & Model', value: `${formData.new_vehicle?.brand} ${formData.new_vehicle?.model}` },
          { label: 'License Plate', value: formData.new_vehicle?.license_plate },
          { label: 'Category', value: formData.new_vehicle?.size_category },
        ],
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        ),
        title: 'Appointment',
        rows: [
          { label: 'Date', value: formData.saturday_date },
          { label: 'Time', value: formData.time_slot },
        ],
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ),
        title: 'Service Package',
        rows: [
          { label: 'Type', value: formData.service_type?.replace('_', ' ') },
          ...(formData.selected_addons && formData.selected_addons.length > 0
            ? [{ label: 'Add-ons', value: `${formData.selected_addons.length} premium add-on(s)` }]
            : []),
        ],
      },
      {
        icon: (
          <svg width="18" height="18" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
        ),
        title: 'Location & Contact',
        rows: [
          { label: 'Name', value: `${formData.first_name} ${formData.last_name}` },
          { label: 'Email', value: formData.email },
          { label: 'Phone', value: formData.phone },
          { label: 'Address', value: formData.address },
          { label: 'Area', value: `${formData.suburb}, ${formData.city} ${formData.postal_code}` },
        ],
      },
    ];

    return (
      <>
        <style>{`
          @keyframes bookingFadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>

        <div style={{ background: '#0A0A0F', minHeight: '100vh', position: 'relative' }} className="flex flex-col items-center px-4 py-16 md:py-24">
          {/* grain overlay */}
          <div style={{
            position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
          }} />

          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 680 }}>
            {/* header */}
            <div style={fadeUp} className="text-center mb-10">
              <p style={{ color: '#E6B31E', letterSpacing: '0.2em', fontSize: 11, textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, marginBottom: 12 }}>
                Step 5 of 5
              </p>
              <h1 style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
                Review Your Booking
              </h1>
              <p style={{ color: '#6B6E75', fontSize: 14, marginTop: 8 }}>Confirm every detail before we proceed to payment</p>
            </div>

            {/* detail cards */}
            <div className="flex flex-col gap-3">
              {sections.map((section, i) => (
                <div
                  key={section.title}
                  style={{
                    ...staggerDelay(i),
                    background: 'rgba(255,255,255,0.035)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '20px 24px',
                  }}
                >
                  {/* section header */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <span style={{ color: '#E6B31E', display: 'flex', alignItems: 'center' }}>{section.icon}</span>
                    <span style={{ color: '#E0E0E3', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 14, letterSpacing: '0.01em' }}>
                      {section.title}
                    </span>
                  </div>
                  {/* rows */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                    {section.rows.map((row) => (
                      <div key={row.label}>
                        <p style={{ color: '#4E5158', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 500, marginBottom: 3 }}>{row.label}</p>
                        <p style={{ color: '#D4D6DB', fontSize: 14, fontWeight: 500, textTransform: row.label === 'Category' ? 'capitalize' : 'none' }}>{row.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* price summary */}
            <div
              style={{
                ...staggerDelay(4),
                background: 'linear-gradient(135deg, rgba(230,179,30,0.06) 0%, rgba(255,255,255,0.04) 100%)',
                border: '1px solid rgba(230,179,30,0.18)',
                borderRadius: 16,
                padding: '28px 28px 24px',
                marginTop: 20,
              }}
            >
              <p style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 18 }}>
                Payment Summary
              </p>

              <div className="flex flex-col gap-2.5">
                <div className="flex justify-between">
                  <span style={{ color: '#8A8D94', fontSize: 14 }}>Base Service</span>
                  <span style={{ color: '#D4D6DB', fontSize: 14, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>R{formData.base_price?.toFixed(2)}</span>
                </div>
                {formData.addon_price && formData.addon_price > 0 && (
                  <div className="flex justify-between">
                    <span style={{ color: '#8A8D94', fontSize: 14 }}>Add-ons</span>
                    <span style={{ color: '#D4D6DB', fontSize: 14, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>R{formData.addon_price.toFixed(2)}</span>
                  </div>
                )}
                {/* divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
                <div className="flex justify-between">
                  <span style={{ color: '#8A8D94', fontSize: 14 }}>Subtotal</span>
                  <span style={{ color: '#D4D6DB', fontSize: 14, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>R{formData.total_price?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: '#5A5D63', fontSize: 13 }}>VAT (15%)</span>
                  <span style={{ color: '#5A5D63', fontSize: 13, fontFamily: 'JetBrains Mono, monospace' }}>R{formData.vat_amount?.toFixed(2)}</span>
                </div>
                {/* total row */}
                <div style={{ marginTop: 10, paddingTop: 14, borderTop: '1px solid rgba(230,179,30,0.25)' }} className="flex justify-between items-baseline">
                  <span style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '0.02em' }}>Total</span>
                  <span style={{ color: '#E6B31E', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 22 }}>R{formData.grand_total?.toFixed(2)}</span>
                </div>
              </div>

              {/* error banner */}
              {bookingError && (
                <div style={{ marginTop: 18, padding: '12px 16px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <p style={{ color: '#f87171', fontSize: 13 }}>{bookingError}</p>
                </div>
              )}

              {/* action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={handleBack}
                  style={{
                    flex: 1, padding: '14px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)',
                    background: 'transparent', color: '#8A8D94', fontSize: 14, fontWeight: 600,
                    cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.02em',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = 'rgba(230,179,30,0.4)'; (e.target as HTMLElement).style.color = '#E6B31E'; }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.12)'; (e.target as HTMLElement).style.color = '#8A8D94'; }}
                >
                  Edit Booking
                </button>
                <button
                  onClick={handleProceedToPayment}
                  disabled={isSubmitting}
                  style={{
                    flex: 2, padding: '14px 0', borderRadius: 10, border: 'none',
                    background: isSubmitting ? 'rgba(230,179,30,0.4)' : 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                    color: '#0A0A0F', fontSize: 14, fontWeight: 700,
                    cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', letterSpacing: '0.04em',
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <div style={{ width: 18, height: 18, border: '2px solid rgba(10,10,15,0.3)', borderTop: '2px solid #0A0A0F', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                      Processing…
                    </>
                  ) : 'Proceed to Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ─── STEP FORM SCREEN ─────────────────────────────────────── */
  return (
    <>
      <style>{`
        @keyframes bookingFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ background: '#0A0A0F', minHeight: '100vh', position: 'relative' }} className="flex flex-col items-center px-4 py-14 md:py-20">
        {/* grain overlay */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
        }} />

        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 860 }} className="flex flex-col items-center">
          {/* header */}
          <div style={fadeUp} className="text-center mb-8">
            <p style={{ color: '#E6B31E', letterSpacing: '0.2em', fontSize: 11, textTransform: 'uppercase', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, marginBottom: 10 }}>
              Vehicle Preservation
            </p>
            <h1 style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 'clamp(1.6rem, 4vw, 2.6rem)', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
              Book Your Service
            </h1>
            <p style={{ color: '#6B6E75', fontSize: 14, marginTop: 8 }}>Reserve your Saturday slot in four simple steps</p>
          </div>

          {/* stepper */}
          <Stepper currentStep={currentStep} steps={STEPS} />

          {/* step content */}
          <div style={{ ...staggerDelay(1), width: '100%' }} className="mt-8 md:mt-12 flex flex-col items-center">
            {currentStep === 1 && <Step1Vehicle onNext={handleStepComplete} />}
            {currentStep === 2 && <Step2Schedule onNext={handleStepComplete} onBack={handleBack} />}
            {currentStep === 3 && (
              <Step3Service
                vehicleCategory={formData.new_vehicle?.size_category || 'sedan'}
                onNext={handleStepComplete}
                onBack={handleBack}
              />
            )}
            {currentStep === 4 && (
              <Step4Location
                defaultValues={{
                  first_name: formData.first_name,
                  last_name: formData.last_name,
                  email: formData.email,
                  phone: formData.phone,
                }}
                onNext={handleStepComplete}
                onBack={handleBack}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
