import React from 'react';

interface StepperProps {
  currentStep: number;
  steps: string[];
}

export const Stepper: React.FC<StepperProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full flex justify-center" style={{ paddingTop: 8, paddingBottom: 32 }}>
      <div className="flex items-center justify-between w-full" style={{ maxWidth: 560 }}>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive   = currentStep === stepNumber;
          const isCompleted = currentStep > stepNumber;


          return (
            <React.Fragment key={stepNumber}>
              {/* ── Node ── */}
              <div className="flex flex-col items-center" style={{ position: 'relative', zIndex: 1 }}>
                {/* outer ring (only when active) */}
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    inset: -4,
                    borderRadius: '50%',
                    background: 'rgba(230,179,30,0.12)',
                    border: '1px solid rgba(230,179,30,0.25)',
                  }} />
                )}

                {/* circle */}
                <div style={{
                  width: 36, height: 36,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 13,
                  fontFamily: 'JetBrains Mono, monospace',
                  fontWeight: 700,
                  transition: 'all 0.35s cubic-bezier(.22,1,.36,1)',
                  background: isCompleted
                    ? '#E6B31E'
                    : isActive
                    ? 'rgba(230,179,30,0.15)'
                    : 'rgba(255,255,255,0.04)',
                  border: isCompleted
                    ? 'none'
                    : isActive
                    ? '1.5px solid #E6B31E'
                    : '1.5px solid rgba(255,255,255,0.12)',
                  color: isCompleted ? '#0A0A0F' : isActive ? '#E6B31E' : '#4E5158',
                  boxShadow: isActive ? '0 0 16px rgba(230,179,30,0.3)' : 'none',
                }}>
                  {isCompleted ? (
                    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : stepNumber}
                </div>

                {/* label */}
                <span style={{
                  marginTop: 10,
                  fontSize: 10,
                  fontFamily: 'Montserrat, sans-serif',
                  fontWeight: 600,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  color: isCompleted || isActive ? '#E6B31E' : '#4E5158',
                  transition: 'color 0.3s',
                }}>
                  {step}
                </span>
              </div>

              {/* ── Connector ── */}
              {index < steps.length - 1 && (
                <div style={{ flex: 1, height: 1, margin: '0 8px', position: 'relative', marginBottom: 20 }}>
                  {/* track */}
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.07)' }} />
                  {/* fill */}
                  <div style={{
                    position: 'absolute', top: 0, bottom: 0, left: 0,
                    width: isCompleted ? '100%' : '0%',
                    background: 'linear-gradient(90deg, #E6B31E, #d4a017)',
                    transition: 'width 0.5s cubic-bezier(.22,1,.36,1)',
                  }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
