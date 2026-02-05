'use client';
import React, { useState, useEffect } from 'react';
import { VehicleSizeCategory } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { FormCard } from './FormCard';

/* ─── shared micro-styles ─────────────────────────────────────── */
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontFamily: 'Montserrat, sans-serif',
  fontWeight: 600,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#6B6E75',
  marginBottom: 8,
};

const inputBase: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.04)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '12px 14px',
  color: '#D4D6DB',
  fontSize: 14,
  fontFamily: 'Montserrat, sans-serif',
  outline: 'none',
  transition: 'border-color 0.25s, box-shadow 0.25s',
  boxSizing: 'border-box',
};

const inputFocusStyle: React.CSSProperties = {
  borderColor: 'rgba(230,179,30,0.45)',
  boxShadow: '0 0 0 3px rgba(230,179,30,0.1)',
};

const errorTextStyle: React.CSSProperties = {
  color: '#f87171',
  fontSize: 12,
  marginTop: 5,
  fontFamily: 'Montserrat, sans-serif',
};

/* ── helpers ── */
function useInputFocus() {
  const [focused, setFocused] = useState(false);
  const handlers = {
    onFocus: () => setFocused(true),
    onBlur:  () => setFocused(false),
  };
  return [focused, handlers] as const;
}

/* ─── brand list ──────────────────────────────────────────────── */
const VEHICLE_BRANDS = [
  'Abarth','Acura','Aixam','Alfa Romeo','Alpine','Ariel','Aston Martin','Audi','Austin',
  'BAC','BAIC','Baojun','Bentley','BMW','Borgward','Brabham','Bugatti','Buick','BYD',
  'Cadillac','Callaway','Caterham','Changan','Changhe','Chery','Chevrolet','Chrysler',
  'Citroën','Cizeta','Cupra','Dacia','Daewoo','DAF','Daihatsu','Daimler','Dallara',
  'De Tomaso','DMC','Dodge','Donkervoort','DS','Eagle','Elva','EXEED','Faraday Future',
  'Ferrari','Fiat','Fisker','Force Motors','Ford','Foton','GAC','Geely','Genesis',
  'GMC','Ginetta','Great Wall','Gumpert','Haima','Haval','Hennessey','Hillman',
  'Hispano-Suiza','Holden','Honda','Hongqi','HSV','Hummer','Hyundai','ICKW','ICONA',
  'Imperial','Ineos','Infiniti','Innocenti','Intermeccanica','International Harvester',
  'Isdera','Isuzu','Iveco','JAC','Jaguar','Jeep','Jenson','JMC','Karma','Koenigsegg',
  'KTM','Lada','Lamborghini','Lancia','Land Rover','LDV','Lexus','Leyland','Lifan',
  'Lincoln','Lister','Local Motors','Lotus','Lucid','Luxgen','Mack','Mahindra','Marcos',
  'Maserati','Matra','Maybach','Mazda','Mazzanti','McLaren','Mercedes-Benz','Mercury',
  'MG','Microcar','MINI','Mitsubishi','Mitsuoka','Morgan','Morris','NIO','Nissan',
  'Noble','Oldsmobile','Opel','Pagani','Panoz','Perodua','Peugeot','Pininfarina',
  'Plymouth','Polestar','Pontiac','Porsche','Proton','Qoros','Radical','Ram','Rambler',
  'Range Rover','Ravon','Reliant','Renault','Rezvani','Rimac','Rinpeed','Rivian',
  'Roewe','Rolls-Royce','Rover','Ruf','Saab','Saleen','Saturn','Scania','Scion',
  'SEAT','Shelby','Škoda','Smart','Spyker','SsangYong','SSC','Studebaker','Subaru',
  'Sunbeam','Suzuki','Tata','Techrules','Tesla','Toyota','Tramontana','Triumph','TVR',
  'Ultima','Vauxhall','Vector','Venturi','VinFast','Volkswagen','Volvo','W Motors',
  'Wanderer','Westfield','Wey','Wiesmann','Wolseley','Wuling','XPeng','Yulon','Zagato',
  'Zastava','Zenvo','Zotye','ZX Auto',
].sort();

const VEHICLE_CATEGORIES: { value: VehicleSizeCategory; label: string; description: string; icon: string }[] = [
  { value: 'sedan',  label: 'Sedan',  description: 'Standard 4-door',   icon: '🚗' },
  { value: 'suv',    label: 'SUV',    description: 'Crossovers & SUVs', icon: '🚙' },
  { value: 'luxury', label: 'Luxury', description: 'Premium vehicles',  icon: '✦'  },
  { value: 'sports', label: 'Sports', description: 'Performance & exotic', icon: '⚡' },
];

/* ─── Field wrappers ──────────────────────────────────────────── */
function TextField({ label, value, onChange, placeholder, error, type = 'text' }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; type?: string;
}) {
  const [focused, fHandlers] = useInputFocus();
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        {...fHandlers}
        style={{
          ...inputBase,
          ...(focused ? inputFocusStyle : {}),
          ...(error ? { borderColor: 'rgba(248,113,113,0.5)' } : {}),
        }}
      />
      {error && <p style={errorTextStyle}>{error}</p>}
    </div>
  );
}

/* ─── component ───────────────────────────────────────────────── */
interface Step1VehicleProps {
  onNext: (data: any) => void;
}

export const Step1Vehicle: React.FC<Step1VehicleProps> = ({ onNext }) => {
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    size_category: '' as VehicleSizeCategory,
    color: '',
    license_plate: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFullyBooked, setIsFullyBooked] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [prices, setPrices] = useState<Record<string, number>>({ sedan: 400, suv: 600, luxury: 800, sports: 750 });
  const [brandFocused, setBrandFocused] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { count } = await supabase
          .from('slots')
          .select('*', { count: 'exact', head: true })
          .eq('is_booked', false)
          .gte('saturday_date', new Date().toISOString().split('T')[0]);
        if (count === 0) setIsFullyBooked(true);
      } catch (e: any) { console.error(e?.message || e); }
      finally { setIsLoadingSlots(false); }
    })();

    (async () => {
      try {
        const { data } = await supabase
          .from('pricing_config')
          .select('sedan_price, suv_price, luxury_price, sports_price')
          .eq('is_active', true).single();
        if (data) setPrices({
          sedan: Number(data.sedan_price), suv: Number(data.suv_price),
          luxury: Number(data.luxury_price), sports: Number(data.sports_price),
        });
      } catch (e) { console.error('Failed to fetch pricing:', e); }
    })();
  }, []);

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.brand)         e.brand         = 'Please select a brand';
    if (!formData.model)         e.model         = 'Model is required';
    if (!formData.license_plate) e.license_plate = 'License plate is required';
    if (!formData.size_category) e.size_category = 'Please select a category';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext({ new_vehicle: formData });
  };

  /* ── render ── */
  return (
    <div className="w-full flex justify-center" style={{ padding: '0 16px' }}>
      <div className="w-full" style={{ maxWidth: 860 }}>

        {/* page heading */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{
            color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
            fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '-0.02em',
          }}>
            Tell Us About Your Vehicle
          </h2>
          <p style={{ color: '#6B6E75', fontSize: 14, marginTop: 6 }}>
            We'll match pricing automatically based on your vehicle details.
          </p>
        </div>

        <FormCard size="large">
          {/* ── fully-booked banner ── */}
          {isFullyBooked && !isLoadingSlots && (
            <div style={{
              marginBottom: 24, padding: '16px 20px', borderRadius: 12,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            }}>
              <h3 style={{ color: '#f87171', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 15, marginBottom: 4 }}>
                Service Fully Booked
              </h3>
              <p style={{ color: '#8A8D94', fontSize: 13, lineHeight: 1.5 }}>
                No Saturday slots are available right now. Please check back soon.
              </p>
            </div>
          )}

          {/* ── section label ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: '#E6B31E', fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Vehicle Details
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* ── brand select ── */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>
              Brand <span style={{ color: '#E6B31E' }}>*</span>
            </label>
            <select
              value={formData.brand}
              onChange={e => set('brand', e.target.value)}
              onFocus={() => setBrandFocused(true)}
              onBlur={() => setBrandFocused(false)}
              style={{
                ...inputBase,
                appearance: 'none',
                WebkitAppearance: 'none',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236B6E75' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: 36,
                cursor: 'pointer',
                ...(brandFocused ? inputFocusStyle : {}),
                ...(errors.brand ? { borderColor: 'rgba(248,113,113,0.5)' } : {}),
              }}
            >
              <option value="" style={{ background: '#0A0A0F', color: '#6B6E75' }}>Select your vehicle brand</option>
              {VEHICLE_BRANDS.map(b => (
                <option key={b} value={b} style={{ background: '#111115', color: '#D4D6DB' }}>{b}</option>
              ))}
            </select>
            {errors.brand && <p style={errorTextStyle}>{errors.brand}</p>}
          </div>

          {/* ── 3-col grid: model / year / color ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 20 }}>
            <TextField label="Model *" placeholder="e.g. A8, X5, 911" value={formData.model} onChange={v => set('model', v)} error={errors.model} />
            <TextField label="Year"    placeholder="2020"            value={formData.year}  onChange={v => set('year', v)}  type="number" />
            <TextField label="Color"   placeholder="Midnight Black"  value={formData.color} onChange={v => set('color', v)} />
          </div>

          {/* ── license plate ── */}
          <TextField
            label="License Plate *"
            placeholder="ABC 123 GP"
            value={formData.license_plate}
            onChange={v => set('license_plate', v.toUpperCase())}
            error={errors.license_plate}
          />

          {/* ── section label ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 32, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: '#E6B31E', fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              Service Category <span style={{ color: '#E6B31E' }}>*</span>
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          <p style={{ color: '#4E5158', fontSize: 12, marginBottom: 16, textAlign: 'center' }}>
            Choose the category that best matches your vehicle
          </p>

          {/* ── category cards ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
            {VEHICLE_CATEGORIES.map(cat => {
              const active = formData.size_category === cat.value;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => set('size_category', cat.value)}
                  style={{
                    background: active ? 'rgba(230,179,30,0.1)' : 'rgba(255,255,255,0.03)',
                    border: active ? '1.5px solid rgba(230,179,30,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14,
                    padding: '18px 14px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.25s cubic-bezier(.22,1,.36,1)',
                    boxShadow: active ? '0 0 18px rgba(230,179,30,0.15)' : 'none',
                  }}
                >
                  {/* top row: icon + label */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <span style={{
                      color: active ? '#E6B31E' : '#D4D6DB',
                      fontFamily: 'Montserrat, sans-serif',
                      fontWeight: 700,
                      fontSize: 14,
                      transition: 'color 0.25s',
                    }}>{cat.label}</span>
                  </div>
                  {/* description */}
                  <p style={{ color: '#4E5158', fontSize: 11, lineHeight: 1.4, marginBottom: 12 }}>{cat.description}</p>
                  {/* price */}
                  <p style={{
                    color: '#E6B31E',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontWeight: 700,
                    fontSize: 18,
                  }}>R{prices[cat.value]}</p>
                </button>
              );
            })}
          </div>
          {errors.size_category && <p style={{ ...errorTextStyle, marginTop: 10, textAlign: 'center' }}>{errors.size_category}</p>}

          {/* ── CTA ── */}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isFullyBooked}
              style={{
                padding: '13px 32px',
                borderRadius: 10,
                border: 'none',
                background: isFullyBooked ? 'rgba(230,179,30,0.25)' : 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                color: '#0A0A0F',
                fontSize: 14,
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                letterSpacing: '0.03em',
                cursor: isFullyBooked ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {isFullyBooked ? 'Fully Booked' : 'Continue to Date Selection →'}
            </button>
          </div>
        </FormCard>
      </div>
    </div>
  );
};
