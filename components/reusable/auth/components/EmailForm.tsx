import React, { useState } from 'react';

interface EmailFormProps {
  onSubmit: (email: string) => Promise<void>;
  loading?: boolean;
  buttonText?: string;
  className?: string;
}

export const EmailForm: React.FC<EmailFormProps> = ({
  onSubmit,
  loading = false,
  buttonText = 'Continue with Email',
  className = '',
}) => {
  const [email, setEmail]   = useState('');
  const [error, setError]   = useState('');
  const [focused, setFocus] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Please enter a valid email address'); return; }
    setError('');
    await onSubmit(email);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      {/* label */}
      <label style={{
        display: 'block', fontSize: 11,
        fontFamily: 'Montserrat, sans-serif', fontWeight: 600,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: '#6B6E75', marginBottom: 8,
      }}>
        Email Address <span style={{ color: '#E6B31E' }}>*</span>
      </label>

      {/* input */}
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="name@example.com"
        disabled={loading}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        style={{
          width: '100%',
          background: 'rgba(255,255,255,0.04)',
          border: error
            ? '1px solid rgba(248,113,113,0.5)'
            : focused
            ? '1px solid rgba(230,179,30,0.45)'
            : '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10,
          padding: '13px 16px',
          color: '#D4D6DB',
          fontSize: 14,
          fontFamily: 'Montserrat, sans-serif',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.25s, box-shadow 0.25s',
          boxShadow: focused ? '0 0 0 3px rgba(230,179,30,0.1)' : 'none',
          opacity: loading ? 0.5 : 1,
        }}
      />

      {/* error */}
      {error && (
        <p style={{ color: '#f87171', fontSize: 12, marginTop: 6, fontFamily: 'Montserrat, sans-serif' }}>{error}</p>
      )}

      {/* submit button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          width: '100%',
          marginTop: 18,
          padding: '14px 0',
          borderRadius: 10,
          border: 'none',
          background: loading
            ? 'rgba(230,179,30,0.3)'
            : 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
          color: '#0A0A0F',
          fontSize: 14,
          fontFamily: 'Montserrat, sans-serif',
          fontWeight: 700,
          letterSpacing: '0.04em',
          cursor: loading ? 'not-allowed' : 'pointer',
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
            Loading…
          </>
        ) : buttonText}
      </button>
    </form>
  );
};
