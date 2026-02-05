'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Slot } from '@/types';
import { FormCard } from './FormCard';

/* ─── shared button styles ─── */
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

/* ─── component ─── */
interface Step2ScheduleProps {
  onNext: (data: any) => void;
  onBack: () => void;
}

export const Step2Schedule: React.FC<Step2ScheduleProps> = ({ onNext, onBack }) => {
  const [slots, setSlots]           = useState<Slot[]>([]);
  const [selectedSlot, setSelected] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase
          .from('slots').select('*')
          .eq('is_booked', false)
          .gte('saturday_date', new Date().toISOString().split('T')[0])
          .order('saturday_date', { ascending: true })
          .order('time_slot',     { ascending: true })
          .limit(20);
        if (error) { console.error(error.message); setSlots([]); return; }
        setSlots(data || []);
      } catch (e: any) { console.error(e?.message || e); }
      finally { setLoading(false); }
    })();
  }, []);

  /* group by date */
  const grouped: Record<string, Slot[]> = {};
  slots.forEach(s => { (grouped[s.saturday_date] ??= []).push(s); });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-ZA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const formatTime = (t: string) => t.substring(0, 5);

  const handleSubmit = () => {
    if (!selectedSlot) return;
    const slot = slots.find(s => s.id === selectedSlot);
    onNext({ slot_id: selectedSlot, saturday_date: slot?.saturday_date, time_slot: slot?.time_slot });
  };

  /* ── shared heading ── */
  const heading = (
    <div style={{ textAlign: 'center', marginBottom: 28 }}>
      <h2 style={{
        color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700,
        fontSize: 'clamp(1.4rem, 3.5vw, 2rem)', letterSpacing: '-0.02em',
      }}>
        Choose Your Saturday Slot
      </h2>
      <p style={{ color: '#6B6E75', fontSize: 14, marginTop: 6 }}>
        Select a date and time that works best for you
      </p>
    </div>
  );

  /* ── loading ── */
  if (loading) return (
    <div className="w-full flex justify-center" style={{ padding: '0 16px' }}>
      <div style={{ maxWidth: 860, width: '100%' }}>
        {heading}
        <FormCard size="large">
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: 40, height: 40, margin: '0 auto 16px',
              border: '2px solid rgba(255,255,255,0.08)',
              borderTop: '2px solid #E6B31E',
              borderRadius: '50%',
              animation: 'spin 0.7s linear infinite',
            }} />
            <p style={{ color: '#6B6E75', fontSize: 14 }}>Loading available slots…</p>
          </div>
        </FormCard>
      </div>
    </div>
  );

  /* ── empty ── */
  if (!Object.keys(grouped).length) return (
    <div className="w-full flex justify-center" style={{ padding: '0 16px' }}>
      <div style={{ maxWidth: 860, width: '100%' }}>
        {heading}
        <FormCard size="large">
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ color: '#6B6E75', fontSize: 14, marginBottom: 20 }}>
              No slots available at the moment. Please check back later.
            </p>
            <button onClick={onBack} style={btnBack}>← Go Back</button>
          </div>
        </FormCard>
      </div>
    </div>
  );

  /* ── main ── */
  return (
    <div className="w-full flex justify-center" style={{ padding: '0 16px' }}>
      <div style={{ maxWidth: 860, width: '100%' }}>
        {heading}

        <FormCard size="large">
          {/* date groups */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 28 }}>
            {Object.entries(grouped).map(([date, dateSlots]) => (
              <div key={date}>
                {/* date row */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <span style={{
                    color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600, fontSize: 14,
                  }}>
                    {formatDate(date)}
                  </span>
                  <span style={{
                    color: '#E6B31E', fontSize: 10, fontFamily: 'Montserrat, sans-serif',
                    fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
                    background: 'rgba(230,179,30,0.1)',
                    border: '1px solid rgba(230,179,30,0.2)',
                    borderRadius: 20, padding: '3px 10px',
                  }}>
                    {dateSlots.length} slot{dateSlots.length !== 1 ? 's' : ''} open
                  </span>
                </div>

                {/* time buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: 10 }}>
                  {dateSlots.map(slot => {
                    const active = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => setSelected(slot.id)}
                        style={{
                          background: active ? 'rgba(230,179,30,0.12)' : 'rgba(255,255,255,0.04)',
                          border: active ? '1.5px solid rgba(230,179,30,0.55)' : '1px solid rgba(255,255,255,0.09)',
                          borderRadius: 12,
                          padding: '14px 8px',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.22s cubic-bezier(.22,1,.36,1)',
                          boxShadow: active ? '0 0 14px rgba(230,179,30,0.18)' : 'none',
                        }}
                      >
                        <div style={{
                          color: active ? '#E6B31E' : '#D4D6DB',
                          fontFamily: 'JetBrains Mono, monospace',
                          fontWeight: 700,
                          fontSize: 18,
                          transition: 'color 0.22s',
                        }}>
                          {formatTime(slot.time_slot)}
                        </div>
                        {active && (
                          <div style={{
                            color: '#E6B31E', fontSize: 10,
                            fontFamily: 'Montserrat, sans-serif',
                            fontWeight: 600, marginTop: 4,
                          }}>
                            Selected
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* nav row */}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="button" onClick={onBack} style={btnBack}>← Back</button>
            <button type="button" onClick={handleSubmit} disabled={!selectedSlot} style={btnPrimary(!selectedSlot)}>
              Continue to Service →
            </button>
          </div>
        </FormCard>
      </div>
    </div>
  );
};
