import React from 'react';

interface TermsCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  termsUrl?: string;
}

export const TermsCheckbox: React.FC<TermsCheckboxProps> = ({
  termsUrl,
  className = '',
  ...props
}) => (
  <div className={`flex items-start gap-3 ${className}`}>
    {/* custom checkbox shell */}
    <div style={{ position: 'relative', width: 18, height: 18, flexShrink: 0, marginTop: 1 }}>
      <input
        id="terms"
        type="checkbox"
        {...props}
        style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 1, margin: 0 }}
      />
      {/* visible box */}
      <div style={{
        width: 18, height: 18, borderRadius: 5,
        border: props.checked ? 'none' : '1.5px solid rgba(255,255,255,0.18)',
        background: props.checked
          ? 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)'
          : 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s',
        boxShadow: props.checked ? '0 0 8px rgba(230,179,30,0.25)' : 'none',
      }}>
        {props.checked && (
          <svg width="11" height="11" viewBox="0 0 20 20" fill="#0A0A0F">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>

    {/* label text */}
    <label htmlFor="terms" style={{ color: '#8A8D94', fontSize: 13, lineHeight: 1.5, cursor: 'pointer', fontFamily: 'Montserrat, sans-serif' }}>
      I agree to the{' '}
      {termsUrl ? (
        <a href={termsUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#E6B31E', textDecoration: 'none' }}>
          Terms and Conditions
        </a>
      ) : (
        <span style={{ color: '#E6B31E' }}>Terms and Conditions</span>
      )}
      {' '}and consent to data processing in accordance with POPIA.
    </label>
  </div>
);
