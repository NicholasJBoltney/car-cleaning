'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { ServiceType, ServiceAddon } from '@/types';
import { FormCard } from './FormCard';

/* ─── nav buttons ─── */
const btnBack: React.CSSProperties = {
  padding: '13px 28px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'transparent', color: '#8A8D94',
  fontSize: 14, fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
  letterSpacing: '0.02em', cursor: 'pointer', transition: 'all 0.2s',
};

const btnPrimary = (disabled: boolean): React.CSSProperties => ({
  padding: '13px 32px', borderRadius: 10, border: 'none',
  background: disabled ? 'rgba(230,179,30,0.2)' : 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
  color: '#0A0A0F', fontSize: 14, fontFamily: 'Montserrat, sans-serif',
  fontWeight: 700, letterSpacing: '0.03em',
  cursor: disabled ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
});

/* ─── service catalogue ─── */
const SERVICE_TYPES: { value: ServiceType; label: string; description: string; features: string[] }[] = [
  {
    value: 'maintenance_refresh', label: 'Maintenance Refresh',
    description: 'Regular upkeep for well-maintained vehicles',
    features: ['pH-neutral rinseless wash','Polymer sealant application','Wheel & tire detail','Glass cleaning','Digital documentation'],
  },
  {
    value: 'full_preservation', label: 'Full Preservation',
    description: 'Comprehensive protection package',
    features: ['Everything in Maintenance','Enhanced Si02 coating','Paint inspection & notes','Interior vacuum','Premium photo documentation'],
  },
  {
    value: 'interior_detail', label: 'Interior Detail',
    description: 'Deep-clean and restore cabin surfaces',
    features: ['Deep leather conditioning & moisturising','Dashboard & console restoration','Carpet & upholstery extraction','Headliner cleaning','Air vent detailing'],
  },
  {
    value: 'paint_correction', label: 'Paint Correction',
    description: 'Remove imperfections and restore gloss',
    features: ['Paint thickness measurement','Multi-stage machine polishing','Swirl mark & scratch removal','Ceramic sealant application','Full correction report'],
  },
];

/* ─── component ─── */
interface Step3ServiceProps {
  vehicleCategory: string;
  onNext: (data: any) => void;
  onBack: () => void;
}

export const Step3Service: React.FC<Step3ServiceProps> = ({ vehicleCategory, onNext, onBack }) => {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [addons, setAddons]                   = useState<ServiceAddon[]>([]);
  const [selectedAddons, setSelectedAddons]   = useState<string[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [prices, setPrices]                   = useState<Record<string, number>>({ sedan: 400, suv: 600, luxury: 800, sports: 750 });

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.from('service_addons').select('*').eq('is_active', true).order('price', { ascending: true });
        if (error) throw error;
        setAddons(data || []);
      } catch (e) { console.error('Error fetching addons:', e); }
      finally { setLoading(false); }
    })();
    (async () => {
      try {
        const { data } = await supabase.from('pricing_config').select('sedan_price, suv_price, luxury_price, sports_price').eq('is_active', true).single();
        if (data) setPrices({ sedan: Number(data.sedan_price), suv: Number(data.suv_price), luxury: Number(data.luxury_price), sports: Number(data.sports_price) });
      } catch (e) { console.error('Failed to fetch pricing:', e); }
    })();
  }, []);

  const toggleAddon = (id: string) =>
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const basePrice = prices[vehicleCategory] || 400;
  const addonTotal = addons.filter(a => selectedAddons.includes(a.id)).reduce((s, a) => s + a.price, 0);
  const total = basePrice + addonTotal;

  const handleSubmit = () => {
    if (!selectedService) return;
    onNext({ service_type: selectedService, selected_addons: selectedAddons, base_price: basePrice, addon_price: addonTotal });
  };

  /* ─── section divider ─── */
  const SectionRule = ({ label }: { label: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '28px 0 18px' }}>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
      <span style={{ color: '#E6B31E', fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    </div>
  );

  /* ─── render ─── */
  return (
    <div className="w-full flex justify-center" style={{ padding: '0 16px' }}>
      <div style={{ maxWidth: 900, width: '100%' }}>

        {/* heading */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '-0.02em' }}>
            Choose Your Service Level
          </h2>
          <p style={{ color: '#6B6E75', fontSize: 14, marginTop: 6 }}>
            All services include digital health reports and photo documentation
          </p>
        </div>

        <FormCard size="large">
          <SectionRule label="Service Type" />

          {/* ── service cards 2-col ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
            {SERVICE_TYPES.map(svc => {
              const active = selectedService === svc.value;
              return (
                <button
                  key={svc.value}
                  type="button"
                  onClick={() => setSelectedService(svc.value)}
                  style={{
                    background: active ? 'rgba(230,179,30,0.08)' : 'rgba(255,255,255,0.03)',
                    border: active ? '1.5px solid rgba(230,179,30,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 16,
                    padding: '22px 20px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(.22,1,.36,1)',
                    boxShadow: active ? '0 0 20px rgba(230,179,30,0.12)' : 'none',
                    position: 'relative' as const,
                  }}
                >
                  {/* selected tick */}
                  {active && (
                    <div style={{
                      position: 'absolute', top: 14, right: 14,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#E6B31E', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <svg width="12" height="12" viewBox="0 0 20 20" fill="#0A0A0F">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* title */}
                  <h3 style={{ color: active ? '#E6B31E' : '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 16, marginBottom: 4, transition: 'color 0.25s', paddingRight: active ? 28 : 0 }}>
                    {svc.label}
                  </h3>
                  <p style={{ color: '#4E5158', fontSize: 12, marginBottom: 14, lineHeight: 1.4 }}>{svc.description}</p>

                  {/* feature list */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {svc.features.map((f, i) => (
                      <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 20 20" fill="#E6B31E" style={{ flexShrink: 0, marginTop: 1 }}>
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span style={{ color: '#8A8D94', fontSize: 12, lineHeight: 1.4 }}>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* base price */}
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span style={{ color: '#4E5158', fontSize: 11, fontFamily: 'Montserrat, sans-serif' }}>From </span>
                    <span style={{ color: '#E6B31E', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 18 }}>R{basePrice}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* ── add-ons ── */}
          {!loading && addons.length > 0 && (
            <>
              <SectionRule label="Premium Add-Ons · Optional" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                {addons.map(addon => {
                  const on = selectedAddons.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddon(addon.id)}
                      style={{
                        background: on ? 'rgba(230,179,30,0.08)' : 'rgba(255,255,255,0.03)',
                        border: on ? '1.5px solid rgba(230,179,30,0.45)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: 12,
                        padding: '16px 14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.22s cubic-bezier(.22,1,.36,1)',
                        boxShadow: on ? '0 0 12px rgba(230,179,30,0.12)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <span style={{ color: on ? '#E6B31E' : '#D4D6DB', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 13, transition: 'color 0.22s' }}>
                          {addon.name}
                        </span>
                        {on && (
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="#E6B31E" style={{ flexShrink: 0 }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <p style={{ color: '#4E5158', fontSize: 11, lineHeight: 1.4, marginBottom: 8 }}>{addon.description}</p>
                      <span style={{ color: '#E6B31E', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 15 }}>+R{addon.price}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* ── price summary ── */}
          {selectedService && (
            <div style={{
              marginTop: 24,
              background: 'linear-gradient(135deg, rgba(230,179,30,0.06) 0%, rgba(255,255,255,0.03) 100%)',
              border: '1px solid rgba(230,179,30,0.18)',
              borderRadius: 14,
              padding: '20px 22px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <p style={{ color: '#6B6E75', fontSize: 12, fontFamily: 'Montserrat, sans-serif', marginBottom: 2 }}>Estimated Total</p>
                  <p style={{ color: '#E6B31E', fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 28 }}>R{total}</p>
                  <p style={{ color: '#4E5158', fontSize: 11, marginTop: 3 }}>+ 15% VAT calculated at checkout</p>
                </div>
                {selectedAddons.length > 0 && (
                  <span style={{
                    color: '#E6B31E', fontSize: 10, fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: 'rgba(230,179,30,0.1)', border: '1px solid rgba(230,179,30,0.2)',
                    borderRadius: 20, padding: '4px 12px',
                  }}>
                    {selectedAddons.length} Add-on{selectedAddons.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── nav ── */}
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" onClick={onBack} style={btnBack}>← Back</button>
            <button type="button" onClick={handleSubmit} disabled={!selectedService} style={btnPrimary(!selectedService)}>
              Continue to Location →
            </button>
          </div>
        </FormCard>
      </div>
    </div>
  );
};
