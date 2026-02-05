'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Mail, Lock, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      console.error('🔴 [LOGIN] Error from URL:', error);
      setErrorMessage(error);
    }
  }, [searchParams]);

  const handleLogin = async () => {
    if (!email) return;

    console.log('📧 [LOGIN] Initiating magic link for:', email);
    setLoading(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error('❌ [LOGIN] Failed to send magic link:', error.message);
        throw error;
      }

      console.log('✅ [LOGIN] Magic link sent successfully');
      setSent(true);
    } catch (error: any) {
      console.error('❌ [LOGIN] Error:', error);
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Success state - Email sent
  if (sent) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#07070A', padding: '2rem 1.5rem' }}
      >
        <div className="max-w-lg w-full">
          {/* Success Card */}
          <div
            className="p-12 text-center transition-all duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(230,179,30,0.12) 0%, rgba(230,179,30,0.04) 100%)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '2px solid rgba(230,179,30,0.3)',
              borderRadius: '24px',
              boxShadow: '0 20px 60px rgba(230,179,30,0.15)',
              animation: 'slideUp 0.6s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Success Icon */}
            <div
              className="w-24 h-24 mx-auto mb-8 flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #E6B31E 0%, #FFD700 100%)',
                borderRadius: '50%',
                boxShadow: '0 8px 32px rgba(230,179,30,0.4)',
                animation: 'scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s backwards',
              }}
            >
              <CheckCircle size={48} strokeWidth={2} style={{ color: '#0A0A0F' }} />
            </div>

            {/* Heading */}
            <h2
              className="text-3xl font-bold mb-4"
              style={{
                color: '#F0F0F3',
                fontFamily: 'Montserrat, sans-serif',
                letterSpacing: '-0.01em',
              }}
            >
              Check Your Email
            </h2>

            {/* Description */}
            <p
              className="mb-2"
              style={{
                color: '#D4D6DB',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '1.125rem',
                lineHeight: '1.7',
              }}
            >
              We've sent a link to
            </p>
            <p
              className="mb-8"
              style={{
                color: '#E6B31E',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '1.125rem',
                fontWeight: 600,
                wordBreak: 'break-all',
              }}
            >
              {email}
            </p>

            <p
              className="mb-10"
              style={{
                color: '#D4D6DB',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.9375rem',
                lineHeight: '1.6',
              }}
            >
              Click the link in your email to securely access your portal.
            </p>

            {/* Different Email Button */}
            <button
              onClick={() => {
                setSent(false);
                setEmail('');
              }}
              className="transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(230,179,30,0.3)',
                borderRadius: '12px',
                padding: '0.875rem 2rem',
                color: '#E6B31E',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '0.9375rem',
                cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(230,179,30,0.1)';
                e.currentTarget.style.borderColor = 'rgba(230,179,30,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.borderColor = 'rgba(230,179,30,0.3)';
              }}
            >
              Use Different Email
            </button>
          </div>

          {/* Security Note */}
          <div
            className="mt-8 p-6 text-center"
            style={{
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
            }}
          >
            <p
              style={{
                color: '#6B6E75',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: '0.875rem',
                lineHeight: '1.6',
              }}
            >
              The link expires after one use for your security.
            </p>
          </div>
        </div>

        <style jsx>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scaleIn {
            from {
              transform: scale(0);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}</style>
      </div>
    );
  }

  // Login form state
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: '#07070A', padding: '2rem 1.5rem' }}
    >
      <div className="max-w-lg w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-4"
            style={{
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '-0.02em',
              lineHeight: '1.1',
            }}
          >
            <span style={{ color: '#F0F0F3' }}>Welcome to </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #E6B31E 0%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              CURA
            </span>
          </h1>
          <p
            style={{
              color: '#D4D6DB',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '1.125rem',
            }}
          >
            Enter your email to receive a secure link
          </p>
        </div>

        {/* Login Card */}
        <div
          className="p-10 transition-all duration-300"
          style={{
            background: 'rgba(255,255,255,0.035)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
          }}
        >
          {/* Error Message */}
          {errorMessage && (
            <div
              className="mb-6 p-4 flex items-start gap-3"
              style={{
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
              }}
            >
              <AlertCircle size={20} style={{ color: '#EF4444', flexShrink: 0, marginTop: '2px' }} />
              <p
                style={{
                  color: '#FCA5A5',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5',
                }}
              >
                {errorMessage}
              </p>
            </div>
          )}

          {/* Email Input */}
          <div className="mb-6">
            <label
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#E6B31E',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 600,
                fontSize: '0.875rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Email Address
            </label>
            <div className="relative">
              <div
                className="absolute left-4 top-1/2"
                style={{ transform: 'translateY(-50%)', pointerEvents: 'none' }}
              >
                <Mail size={20} style={{ color: '#6B6E75' }} />
              </div>
              <input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                className="w-full transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '1rem 1rem 1rem 3rem',
                  color: '#F0F0F3',
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: '1rem',
                  outline: 'none',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(230,179,30,0.5)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleLogin}
            disabled={!email || loading}
            className="w-full transition-all duration-300 flex items-center justify-center gap-3 group"
            style={{
              background: email && !loading ? 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)' : 'rgba(107,110,117,0.2)',
              border: 'none',
              borderRadius: '12px',
              padding: '1.125rem',
              color: email && !loading ? '#0A0A0F' : '#6B6E75',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 700,
              fontSize: '1rem',
              letterSpacing: '0.02em',
              cursor: email && !loading ? 'pointer' : 'not-allowed',
              boxShadow: email && !loading ? '0 4px 20px rgba(230,179,30,0.3)' : 'none',
            }}
            onMouseEnter={(e) => {
              if (email && !loading) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,179,30,0.4)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = email && !loading ? '0 4px 20px rgba(230,179,30,0.3)' : 'none';
            }}
          >
            {loading ? (
              <>
                <div
                  className="animate-spin"
                  style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(10,10,15,0.3)',
                    borderTopColor: '#0A0A0F',
                    borderRadius: '50%',
                  }}
                />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>Send Link</span>
                <ArrowRight
                  size={20}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          {/* Divider */}
          <div
            className="my-8"
            style={{
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(230,179,30,0.2), transparent)',
            }}
          />

          {/* Info Text */}
          <p
            className="text-center"
            style={{
              color: '#6B6E75',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.875rem',
              lineHeight: '1.6',
            }}
          >
            No password required. We'll email you a secure link to access your account.
          </p>
        </div>
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#07070A', padding: '2rem 1.5rem' }}
      >
        <div
          className="p-12 text-center"
          style={{
            background: 'rgba(255,255,255,0.035)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '24px',
          }}
        >
          <div
            className="animate-spin h-12 w-12 mx-auto mb-4"
            style={{
              border: '4px solid rgba(230,179,30,0.2)',
              borderTopColor: '#E6B31E',
              borderRadius: '50%',
            }}
          />
          <p style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}>Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
