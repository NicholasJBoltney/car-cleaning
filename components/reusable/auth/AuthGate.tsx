'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthAdapter } from './adapters/AuthAdapter.interface';
import { EmailForm } from './components/EmailForm';
import { TermsCheckbox } from './components/TermsCheckbox';

export interface AuthTheme {
  primaryColor?: string;
  backgroundColor?: string;
}

export interface AuthGateConfig {
  provider: 'supabase' | 'custom';
  authAdapter: AuthAdapter;
  title?: string;
  subtitle?: string;
  redirectOnSuccess?: string;
  requireTerms?: boolean;
  termsUrl?: string;
  theme?: AuthTheme;
  onSuccess?: (user: any) => void;
}

interface AuthGateProps {
  config: AuthGateConfig;
}

/* ── shared shell ── */
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        @keyframes authFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div style={{ background: '#0A0A0F', minHeight: '100vh', position: 'relative' }} className="flex flex-col items-center justify-center px-4 py-16">
        {/* grain */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
        }} />
        <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440 }}>
          {children}
        </div>
      </div>
    </>
  );
}

export const AuthGate: React.FC<AuthGateProps> = ({ config }) => {
  const router = useRouter();
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);
  const [termsAccepted, setTerms]       = useState(!config.requireTerms);
  const [emailSent, setEmailSent]       = useState(false);

  useEffect(() => {
    (async () => {
      const { session } = await config.authAdapter.getSession();
      if (session) {
        if (config.onSuccess) config.onSuccess(session.user);
        if (config.redirectOnSuccess) router.push(config.redirectOnSuccess);
      }
    })();
  }, [config, router]);

  const handleLogin = async (email: string) => {
    if (config.requireTerms && !termsAccepted) {
      setError('You must agree to the terms and conditions.');
      return;
    }
    setLoading(true);
    setError(null);

    const redirectUrl = config.redirectOnSuccess
      ? new URL(config.redirectOnSuccess, window.location.origin).toString()
      : undefined;

    const { error } = await config.authAdapter.signInWithEmail(email, redirectUrl);
    setLoading(false);

    if (error) setError(error.message);
    else        setEmailSent(true);
  };

  /* ── email-sent confirmation ── */
  if (emailSent) {
    return (
      <Shell>
        <div style={{
          animation: 'authFadeUp 0.45s cubic-bezier(.22,1,.36,1) both',
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: '48px 36px',
          textAlign: 'center',
        }}>
          {/* envelope icon */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 24px',
            background: 'rgba(230,179,30,0.08)',
            border: '1px solid rgba(230,179,30,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E6B31E" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M22 7l-10 6L2 7" />
            </svg>
          </div>

          <h2 style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 22, marginBottom: 10 }}>
            Check your email
          </h2>
          <p style={{ color: '#6B6E75', fontSize: 14, lineHeight: 1.6, marginBottom: 28 }}>
            We've sent a magic link to your inbox.<br />Click the link to sign in and continue.
          </p>

          <button
            onClick={() => setEmailSent(false)}
            style={{
              background: 'none', border: 'none', padding: 0,
              color: '#E6B31E', fontSize: 13, fontFamily: 'Montserrat, sans-serif',
              fontWeight: 600, cursor: 'pointer', letterSpacing: '0.02em',
            }}
          >
            ← Use a different email
          </button>
        </div>
      </Shell>
    );
  }

  /* ── main login form ── */
  return (
    <Shell>
      <div style={{
        animation: 'authFadeUp 0.45s cubic-bezier(.22,1,.36,1) both',
        background: 'rgba(255,255,255,0.035)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 18,
        padding: '48px 36px 40px',
      }}>
        {/* brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, margin: '0 auto 20px',
            background: 'linear-gradient(135deg, rgba(230,179,30,0.15) 0%, rgba(230,179,30,0.05) 100%)',
            border: '1px solid rgba(230,179,30,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E6B31E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>

          {config.title && (
            <h1 style={{ color: '#F0F0F3', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: 22, letterSpacing: '-0.02em', marginBottom: 6 }}>
              {config.title}
            </h1>
          )}
          {config.subtitle && (
            <p style={{ color: '#6B6E75', fontSize: 14 }}>{config.subtitle}</p>
          )}
        </div>

        {/* error banner */}
        {error && (
          <div style={{
            marginBottom: 20, padding: '12px 16px', borderRadius: 10,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.22)',
          }}>
            <p style={{ color: '#f87171', fontSize: 13, fontFamily: 'Montserrat, sans-serif' }}>{error}</p>
          </div>
        )}

        {/* form + terms */}
        <EmailForm onSubmit={handleLogin} loading={loading} />

        {config.requireTerms && (
          <div style={{ marginTop: 20 }}>
            <TermsCheckbox
              checked={termsAccepted}
              onChange={(e) => {
                setTerms(e.target.checked);
                if (e.target.checked) setError(null);
              }}
              termsUrl={config.termsUrl}
            />
          </div>
        )}
      </div>
    </Shell>
  );
};
