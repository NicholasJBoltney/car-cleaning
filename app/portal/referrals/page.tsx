'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Badge, Input } from '@/components/shared';
import { supabase } from '@/lib/supabase/client';
import { getReferralStats } from '@/lib/referrals';

export default function ReferralsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/auth/login');
      return;
    }
    setUser(user);
    fetchStats(user.id);
  };

  const fetchStats = async (userId: string) => {
    try {
      const data = await getReferralStats(userId);
      setStats(data);
    } catch (error) {
      console.error('Error fetching referral stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Check out Bespoke Car Preservation - premium mobile detailing for your luxury vehicle! Use my code ${stats.code} to get R200 off your first service: ${stats.referralLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center" style={{ background: '#07070A' }}>
        <div
          className="p-12 text-center"
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
          }}
        >
          <div
            className="animate-spin h-12 w-12 rounded-full mx-auto mb-4"
            style={{
              border: '4px solid rgba(230,179,30,0.2)',
              borderTopColor: '#E6B31E',
            }}
          />
          <p style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}>Loading referral program...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-4" style={{ background: '#07070A' }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-5xl font-bold mb-4"
            style={{
              color: '#F0F0F3',
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '-0.02em',
            }}
          >
            <span
              style={{
                background: 'linear-gradient(135deg, #E6B31E 0%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Referral Program
            </span>
          </h1>
          <p
            className="text-xl"
            style={{
              color: '#D4D6DB',
              fontFamily: 'Montserrat, sans-serif',
              fontWeight: 300,
            }}
          >
            Share the luxury. Earn rewards.
          </p>
        </div>

        {/* Credits Banner */}
        <div
          className="p-10 mb-8 text-center transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(230,179,30,0.15) 0%, rgba(230,179,30,0.05) 100%)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(230,179,30,0.3)',
            borderRadius: '24px',
            boxShadow: '0 8px 40px rgba(230,179,30,0.2)',
          }}
        >
          <div className="mb-6">
            <p
              className="text-sm mb-3"
              style={{
                color: '#D4D6DB',
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.15em',
                fontWeight: 500,
              }}
            >
              Available Credits
            </p>
            <p
              className="text-7xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #E6B31E 0%, #FFD700 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontFamily: 'Montserrat, sans-serif',
                textShadow: '0 0 60px rgba(230,179,30,0.3)',
              }}
            >
              R{stats?.creditsBalance?.toFixed(2) || '0.00'}
            </p>
          </div>
          <div className="flex justify-center gap-12 text-sm">
            <div>
              <p style={{ color: '#6B6E75', fontFamily: 'Montserrat, sans-serif', marginBottom: '8px' }}>
                Lifetime Earned
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif' }}
              >
                R{stats?.lifetimeEarned?.toFixed(2) || '0.00'}
              </p>
            </div>
            <div>
              <p style={{ color: '#6B6E75', fontFamily: 'Montserrat, sans-serif', marginBottom: '8px' }}>
                Total Referrals
              </p>
              <p
                className="text-2xl font-bold"
                style={{ color: '#E6B31E', fontFamily: 'Montserrat, sans-serif' }}
              >
                {stats?.completedReferrals || 0}
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div
          className="p-8 mb-8"
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
          }}
        >
          <h2
            className="text-2xl font-bold mb-8"
            style={{
              color: '#F0F0F3',
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: '🔗', title: 'Share Your Link', desc: 'Send your unique referral link to friends and neighbors' },
              { emoji: '🚗', title: 'They Book Service', desc: 'Your friend gets R200 off their first service' },
              { emoji: '💰', title: 'You Earn R200', desc: 'Credits automatically added to your account' },
            ].map((step, idx) => (
              <div key={idx} className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{
                    background: 'rgba(230,179,30,0.15)',
                    border: '1px solid rgba(230,179,30,0.3)',
                  }}
                >
                  <span style={{ fontSize: '2.5rem' }}>{step.emoji}</span>
                </div>
                <h3
                  className="font-bold mb-2"
                  style={{
                    color: '#E6B31E',
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: '1.125rem',
                  }}
                >
                  {idx + 1}. {step.title}
                </h3>
                <p
                  className="text-sm"
                  style={{
                    color: '#D4D6DB',
                    fontFamily: 'Montserrat, sans-serif',
                    lineHeight: '1.6',
                  }}
                >
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Your Referral Code */}
        <div
          className="p-8 mb-8"
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
          }}
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{
              color: '#F0F0F3',
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            Your Referral Code
          </h2>

          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-3"
              style={{
                color: '#D4D6DB',
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Referral Code
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={stats?.code || ''}
                readOnly
                className="flex-1 text-center font-bold transition-all duration-300"
                style={{
                  background: 'rgba(230,179,30,0.1)',
                  border: '2px solid rgba(230,179,30,0.3)',
                  borderRadius: '12px',
                  padding: '1rem',
                  color: '#E6B31E',
                  fontSize: '1.5rem',
                  fontFamily: 'JetBrains Mono, monospace',
                  letterSpacing: '0.2em',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => copyToClipboard(stats?.code || '')}
                className="px-6 py-3 rounded-xl font-bold tracking-wide uppercase transition-all duration-300"
                style={{
                  background: copied
                    ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                    : 'linear-gradient(135deg, #E6B31E 0%, #d4a017 100%)',
                  color: '#0A0A0F',
                  fontSize: '0.875rem',
                  fontFamily: 'Montserrat, sans-serif',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: copied
                    ? '0 4px 20px rgba(34,197,94,0.3)'
                    : '0 4px 20px rgba(230,179,30,0.3)',
                  minWidth: '120px',
                }}
                onMouseEnter={(e) => {
                  if (!copied) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(230,179,30,0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copied) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(230,179,30,0.3)';
                  }
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label
              className="block text-sm font-medium mb-3"
              style={{
                color: '#D4D6DB',
                fontFamily: 'Montserrat, sans-serif',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Share Link
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                value={stats?.referralLink || ''}
                readOnly
                className="flex-1 transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  color: '#D4D6DB',
                  fontSize: '0.875rem',
                  fontFamily: 'Montserrat, sans-serif',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => copyToClipboard(stats?.referralLink || '')}
                className="px-6 py-3 rounded-xl font-semibold transition-all duration-300"
                style={{
                  background: copied ? 'rgba(34,197,94,0.2)' : 'rgba(255,255,255,0.05)',
                  color: copied ? '#22c55e' : '#E6B31E',
                  border: `1px solid ${copied ? 'rgba(34,197,94,0.3)' : 'rgba(230,179,30,0.3)'}`,
                  fontSize: '0.875rem',
                  fontFamily: 'Montserrat, sans-serif',
                  cursor: 'pointer',
                  minWidth: '80px',
                }}
                onMouseEnter={(e) => {
                  if (!copied) {
                    e.currentTarget.style.background = 'rgba(230,179,30,0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!copied) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  }
                }}
              >
                {copied ? '✓' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={shareViaWhatsApp}
              className="w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-300"
              style={{
                background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                color: '#FFFFFF',
                fontSize: '0.875rem',
                fontFamily: 'Montserrat, sans-serif',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(37,211,102,0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(37,211,102,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.3)';
              }}
            >
              📱 Share on WhatsApp
            </button>
            <button
              onClick={() => {
                const mailto = `mailto:?subject=Get R200 off Bespoke Car Preservation&body=I use Bespoke Preservation for my car and thought you'd love it too! Use code ${stats?.code} to get R200 off: ${stats?.referralLink}`;
                window.open(mailto);
              }}
              className="w-full py-4 rounded-xl font-bold tracking-wide transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.05)',
                color: '#E6B31E',
                border: '1px solid rgba(230,179,30,0.3)',
                fontSize: '0.875rem',
                fontFamily: 'Montserrat, sans-serif',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(230,179,30,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              ✉️ Share via Email
            </button>
          </div>
        </div>

        {/* Referral Stats */}
        <div
          className="p-8 mb-8"
          style={{
            background: 'rgba(255,255,255,0.035)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '18px',
          }}
        >
          <h2
            className="text-2xl font-bold mb-6"
            style={{
              color: '#F0F0F3',
              fontFamily: 'Montserrat, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            Your Referrals
          </h2>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { value: stats?.totalReferrals || 0, label: 'Total', color: '#E6B31E' },
              { value: stats?.completedReferrals || 0, label: 'Completed', color: '#22c55e' },
              { value: stats?.pendingReferrals || 0, label: 'Pending', color: '#eab308' },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                }}
              >
                <p
                  className="text-4xl font-bold mb-2"
                  style={{
                    color: stat.color,
                    fontFamily: 'Montserrat, sans-serif',
                  }}
                >
                  {stat.value}
                </p>
                <p
                  className="text-sm"
                  style={{
                    color: '#D4D6DB',
                    fontFamily: 'Montserrat, sans-serif',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          {stats?.completedReferrals === 0 && (
            <div
              className="p-6 text-center"
              style={{
                background: 'rgba(230,179,30,0.05)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(230,179,30,0.2)',
                borderRadius: '16px',
              }}
            >
              <p className="mb-4" style={{ color: '#D4D6DB', fontFamily: 'Montserrat, sans-serif' }}>
                You haven't earned any credits yet. Start sharing!
              </p>
              <p
                className="text-sm"
                style={{
                  color: '#6B6E75',
                  fontFamily: 'Montserrat, sans-serif',
                }}
              >
                💡 Tip: Share with your estate's WhatsApp group or neighborhood Facebook page
              </p>
            </div>
          )}
        </div>

        {/* Estate Ambassador Program Teaser */}
        <div
          className="p-8 text-center transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, rgba(230,179,30,0.1) 0%, rgba(230,179,30,0.03) 100%)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(230,179,30,0.2)',
            borderRadius: '18px',
          }}
        >
          <h3
            className="text-2xl font-bold mb-4"
            style={{
              color: '#F0F0F3',
              fontFamily: 'Montserrat, sans-serif',
            }}
          >
            Want to Earn Even More?
          </h3>
          <p
            className="mb-6"
            style={{
              color: '#D4D6DB',
              fontFamily: 'Montserrat, sans-serif',
              lineHeight: '1.7',
              maxWidth: '600px',
              margin: '0 auto 1.5rem',
            }}
          >
            Refer 5+ neighbors and qualify for our Estate Ambassador program. Earn 10% commission on every referral!
          </p>
          <div className="inline-flex items-center gap-3">
            <span
              style={{
                color: '#E6B31E',
                fontFamily: 'Montserrat, sans-serif',
                fontWeight: 700,
                fontSize: '1.125rem',
              }}
            >
              Coming Soon
            </span>
            <Badge variant="info">VIP Program</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
