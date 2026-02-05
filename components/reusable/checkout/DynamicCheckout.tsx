'use client';

import React, { useEffect, useState } from 'react';
import { PaymentAdapter } from './adapters/PaymentAdapter.interface';
import { PaystackAdapter } from './adapters/PaystackAdapter';
import { getAccessToken } from '@/lib/supabase/client';

export interface CheckoutDataSchema {
  sections: {
    title: string;
    fields: {
      label: string;
      value: string | number | undefined | null;
      type?: 'text' | 'date' | 'currency';
    }[];
  }[];
}

export interface PricingBreakdown {
  base: number;
  addons: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface CheckoutConfig<TData = any> {
  paymentProvider: 'paystack' | 'custom';
  paymentAdapter: PaymentAdapter | any;
  bookingData: TData;
  dataSchema: CheckoutDataSchema;
  pricingCalculator: (data: TData) => PricingBreakdown;
  currency: string;
  createEndpoint?: string;
  verifyEndpoint: string;
  requireAuthentication: boolean;
  userEmail: string;
  onSuccess: (bookingId: string) => void;
  onError?: (error: Error) => void;
  bookingId?: string;
}

interface DynamicCheckoutProps {
  config: CheckoutConfig;
}

/* ── section divider ── */
const SectionRule = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    <span style={{ color: '#E6B31E', fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
  </div>
);

export const DynamicCheckout: React.FC<DynamicCheckoutProps> = ({ config }) => {
  const [loading, setLoading]                   = useState(false);
  const [paymentInitialized, setPayInit]        = useState(false);
  const [pricing, setPricing]                   = useState<PricingBreakdown | null>(null);

  useEffect(() => {
    setPricing(config.pricingCalculator(config.bookingData));
    (async () => {
      try {
        await config.paymentAdapter.initialize();
        setPayInit(true);
      } catch (err) {
        console.error('Failed to initialize payment adapter', err);
        if (config.onError) config.onError(err as Error);
      }
    })();
  }, [config]);

  const handlePay = async () => {
    setLoading(true);
    try {
      if (!pricing) return;

      const intent = await config.paymentAdapter.createPayment(
        pricing.total,
        config.userEmail,
        { booking_id: config.bookingId }
      );

      if (config.paymentProvider === 'paystack') {
        await (config.paymentAdapter as PaystackAdapter).executePayment(
          intent,
          config.userEmail,
          {
            onSuccess: async (reference: string) => { await verifyPayment(reference); },
            onClose:   () => { setLoading(false); },
          }
        );
      }
    } catch (error: any) {
      console.error('Payment flow error:', error);
      setLoading(false);
      if (config.onError) config.onError(error);
      else alert('Payment failed: ' + error.message);
    }
  };

  const verifyPayment = async (reference: string) => {
    try {
      const res = await fetch(config.verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + (await getAccessToken()),
        },
        body: JSON.stringify({ reference, booking_id: config.bookingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      config.onSuccess(config.bookingId!);
    } catch (error: any) {
      console.error('Verification error:', error);
      if (config.onError) config.onError(error);
      else alert('Payment succeeded but verification failed. Please contact support.');
    }
  };

  if (!pricing) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{
          width: 36, height: 36, margin: '0 auto 12px',
          border: '2px solid rgba(255,255,255,0.08)',
          borderTop: '2px solid #E6B31E',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{ color: '#6B6E75', fontSize: 14 }}>Loading details…</p>
      </div>
    );
  }

  /* ── glass panel helper ── */
  const panel = (children: React.ReactNode, extraStyle?: React.CSSProperties) => (
    <div style={{
      background: 'rgba(255,255,255,0.035)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      padding: '24px 22px',
      ...extraStyle,
    }}>
      {children}
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

        {/* ── left: review sections ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {config.dataSchema.sections.map((section, idx) => (
            <div key={idx}>
              {panel(
                <>
                  <SectionRule label={section.title} />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {section.fields.map((field, fIdx) => (
                      <div key={fIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ color: '#6B6E75', fontSize: 13, fontFamily: 'Montserrat, sans-serif' }}>{field.label}</span>
                        <span style={{
                          color: '#D4D6DB', fontSize: 13, fontWeight: 600,
                          fontFamily: 'Montserrat, sans-serif',
                          textTransform: field.label === 'Service Type' ? 'capitalize' : 'none',
                        }}>
                          {field.value ?? '—'}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* ── right: pricing + pay ── */}
        <div>
          {panel(
            <>
              <SectionRule label="Payment Summary" />

              {/* line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8A8D94', fontSize: 13 }}>Base Service</span>
                  <span style={{ color: '#D4D6DB', fontSize: 13, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
                    {config.currency} {pricing.base.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8A8D94', fontSize: 13 }}>Add-ons</span>
                  <span style={{ color: '#D4D6DB', fontSize: 13, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
                    {config.currency} {pricing.addons.toFixed(2)}
                  </span>
                </div>
                {/* divider */}
                <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '2px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#8A8D94', fontSize: 13 }}>Subtotal</span>
                  <span style={{ color: '#D4D6DB', fontSize: 13, fontWeight: 500, fontFamily: 'JetBrains Mono, monospace' }}>
                    {config.currency} {pricing.subtotal.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#5A5D63', fontSize: 12 }}>VAT (15%)</span>
                  <span style={{ color: '#5A5D63', fontSize: 12, fontFamily: 'JetBrains Mono, monospace' }}>
                    {config.currency} {pricing.tax.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* total row */}
              <div style={{
                paddingTop: 14, marginBottom: 22,
                borderTop: '1px solid rgba(230,179,30,0.22)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
              }}>
                <span style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, letterSpacing: '0.02em' }}>
                  Total
                </span>
                <span style={{ color: '#E6B31E', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 22 }}>
                  {config.currency} {pricing.total.toFixed(2)}
                </span>
              </div>

              {/* pay button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={loading || !paymentInitialized}
                style={{
                  width: '100%',
                  padding: '15px 0',
                  borderRadius: 10,
                  border: 'none',
                  background: (loading || !paymentInitialized)
                    ? 'rgba(230,179,30,0.25)'
                    : 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                  color: '#0A0A0F',
                  fontSize: 15,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: (loading || !paymentInitialized) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? (
                  <>
                    <div style={{
                      width: 18, height: 18,
                      border: '2px solid rgba(10,10,15,0.25)',
                      borderTop: '2px solid #0A0A0F',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }} />
                    Processing…
                  </>
                ) : 'Confirm & Pay'}
              </button>

              {/* trust line */}
              <p style={{
                textAlign: 'center', marginTop: 14,
                color: '#4E5158', fontSize: 11,
                fontFamily: 'Montserrat, sans-serif',
              }}>
                Secured payment via {config.paymentProvider === 'paystack' ? 'Paystack' : 'Provider'}
              </p>
            </>,
            { position: 'sticky', top: 96 }
          )}
        </div>
      </div>
    </div>
  );
};
