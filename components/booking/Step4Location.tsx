'use client';
import React, { useState } from 'react';
import { FormCard } from './FormCard';

/* ─── shared styles ─── */
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11,
  fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
  letterSpacing: '0.1em', textTransform: 'uppercase',
  color: '#6B6E75', marginBottom: 8,
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
  boxSizing: 'border-box' as const,
};

const inputFocusStyle: React.CSSProperties = {
  borderColor: 'rgba(230,179,30,0.45)',
  boxShadow: '0 0 0 3px rgba(230,179,30,0.1)',
};

const errorText: React.CSSProperties = {
  color: '#f87171', fontSize: 12, marginTop: 5, fontFamily: 'Montserrat, sans-serif',
};

const helperText: React.CSSProperties = {
  color: '#4E5158', fontSize: 11, marginTop: 5, fontFamily: 'Montserrat, sans-serif',
};

const btnBack: React.CSSProperties = {
  padding: '13px 28px', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'transparent', color: '#8A8D94',
  fontSize: 14, fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
  letterSpacing: '0.02em', cursor: 'pointer', transition: 'all 0.2s',
};

const btnPrimary: React.CSSProperties = {
  padding: '13px 32px', borderRadius: 10, border: 'none',
  background: 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
  color: '#0A0A0F', fontSize: 14, fontFamily: 'Montserrat, sans-serif',
  fontWeight: 700, letterSpacing: '0.03em', cursor: 'pointer', transition: 'all 0.2s',
};

/* ─── micro field components ─── */
function useF() {
  const [f, setF] = useState(false);
  return [f, { onFocus: () => setF(true), onBlur: () => setF(false) }] as const;
}

function Field({ label, value, onChange, placeholder, error, helper, type = 'text', required }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; helper?: string;
  type?: string; required?: boolean;
}) {
  const [focused, fh] = useF();
  return (
    <div>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: '#E6B31E' }}> *</span>}
      </label>
      <input
        type={type} value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        {...fh}
        style={{
          ...inputBase,
          ...(focused ? inputFocusStyle : {}),
          ...(error ? { borderColor: 'rgba(248,113,113,0.5)' } : {}),
        }}
      />
      {error  && <p style={errorText}>{error}</p>}
      {helper && !error && <p style={helperText}>{helper}</p>}
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, helper }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; helper?: string;
}) {
  const [focused, fh] = useF();
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        {...fh}
        style={{
          ...inputBase,
          minHeight: 100,
          resize: 'vertical' as const,
          ...(focused ? inputFocusStyle : {}),
        }}
      />
      {helper && <p style={helperText}>{helper}</p>}
    </div>
  );
}

/* ─── section rule ─── */
const SectionRule = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 18px' }}>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
    <span style={{ color: '#E6B31E', fontSize: 10, fontFamily: 'Montserrat, sans-serif', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' }}>{label}</span>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
  </div>
);

/* ─── component ─── */
interface Step4LocationProps {
  onNext: (data: any) => void;
  onBack: () => void;
  defaultValues?: { first_name?: string; last_name?: string; email?: string; phone?: string };
}

export const Step4Location: React.FC<Step4LocationProps> = ({ onNext, onBack, defaultValues }) => {
  const [formData, setFormData] = useState({
    first_name:        defaultValues?.first_name || '',
    last_name:         defaultValues?.last_name  || '',
    email:             defaultValues?.email      || '',
    phone:             defaultValues?.phone      || '',
    address:           '',
    suburb:            '',
    city:              '',
    postal_code:       '',
    gate_access_notes: '',
    special_requests:  '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.first_name)  e.first_name  = 'First name is required';
    if (!formData.last_name)   e.last_name   = 'Last name is required';
    if (!formData.email) {
      e.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      e.email = 'Please enter a valid email';
    }
    if (!formData.phone) {
      e.phone = 'Phone number is required';
    } else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      e.phone = 'Please enter a valid phone number';
    }
    if (!formData.address)     e.address     = 'Street address is required';
    if (!formData.suburb)      e.suburb      = 'Suburb is required';
    if (!formData.city)        e.city        = 'City is required';
    if (!formData.postal_code) e.postal_code = 'Postal code is required';
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onNext(formData);
  };

  /* ── render ── */
  return (
    <div className="w-full flex justify-center" style={{ padding: '0 16px' }}>
      <div style={{ maxWidth: 720, width: '100%' }}>

        {/* heading */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h2 style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '-0.02em' }}>
            Contact & Service Location
          </h2>
          <p style={{ color: '#6B6E75', fontSize: 14, marginTop: 6 }}>
            Where should we come to preserve your vehicle?
          </p>
        </div>

        <FormCard size="medium">
          {/* ── your details ── */}
          <SectionRule label="Your Details" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
            <Field label="First Name" value={formData.first_name} onChange={v => set('first_name', v)} placeholder="John" error={errors.first_name} required />
            <Field label="Last Name"  value={formData.last_name}  onChange={v => set('last_name', v)}  placeholder="Smith" error={errors.last_name} required />
            <Field label="Email"      value={formData.email}      onChange={v => set('email', v)}      placeholder="john@example.com" type="email" error={errors.email} helper="For booking confirmation and digital reports" required />
            <Field label="Phone"      value={formData.phone}      onChange={v => set('phone', v)}      placeholder="+27 82 123 4567" type="tel" error={errors.phone} helper="For service updates and arrival notifications" required />
          </div>

          {/* ── location ── */}
          <SectionRule label="Service Location" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Field label="Street Address" value={formData.address} onChange={v => set('address', v)} placeholder="123 Main Street, Estate Name" error={errors.address} helper="Include estate or complex name if applicable" required />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
              <Field label="Suburb"      value={formData.suburb}      onChange={v => set('suburb', v)}      placeholder="Sandton"       error={errors.suburb}      required />
              <Field label="City"        value={formData.city}        onChange={v => set('city', v)}        placeholder="Johannesburg" error={errors.city}        required />
              <Field label="Postal Code" value={formData.postal_code} onChange={v => set('postal_code', v)} placeholder="2196"         error={errors.postal_code} required />
            </div>

            <TextArea label="Gate Access / Security Instructions" value={formData.gate_access_notes} onChange={v => set('gate_access_notes', v)} placeholder="Gate code: 1234 | Contact security: John (+27 82…)" helper="Help us access your property smoothly" />
            <TextArea label="Special Requests or Notes"          value={formData.special_requests}  onChange={v => set('special_requests', v)}  placeholder="Specific concerns, parking instructions, etc." />
          </div>

          {/* ── estate-friendly badge ── */}
          <div style={{
            marginTop: 24,
            background: 'rgba(230,179,30,0.05)',
            border: '1px solid rgba(230,179,30,0.18)',
            borderRadius: 12,
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="#E6B31E" style={{ flexShrink: 0, marginTop: 1 }}>
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: 13, marginBottom: 3 }}>
                Estate-Friendly Service
              </h4>
              <p style={{ color: '#6B6E75', fontSize: 12, lineHeight: 1.5 }}>
                Our silent, waterless technology is approved for luxury estates and HOA-managed properties. We arrive quietly and leave no mess or water runoff.
              </p>
            </div>
          </div>

          {/* ── nav ── */}
          <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" onClick={onBack} style={btnBack}>← Back</button>
            <button type="button" onClick={handleSubmit} style={btnPrimary}>
              Review & Proceed to Payment →
            </button>
          </div>
        </FormCard>
      </div>
    </div>
  );
};
