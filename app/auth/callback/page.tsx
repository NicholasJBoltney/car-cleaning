'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Card } from '@/components/shared';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleCallback = async () => {
      // Check if we have a code in the URL (PKCE flow)
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (code) {
        await supabase.auth.exchangeCodeForSession(code);
      }

      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.error('Auth error:', error);
        router.push('/auth/login?error=' + encodeURIComponent(error.message));
        return;
      }

      if (session) {
        // Ensure user profile exists
        try {
          await fetch('/api/users/ensure-profile', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            }
          });
        } catch (err) {
          console.error('Failed to ensure user profile:', err);
          // Continue anyway - not blocking
        }

        // Check for redirect destination in URL params (from booking flow)
        let next = searchParams.get('next');

        // If 'next' is a full URL, extract just the pathname
        if (next && next.startsWith('http')) {
          try {
            const url = new URL(next);
            next = url.pathname;
          } catch (e) {
            // If parsing fails, use default
            next = null;
          }
        }

        const destination = next || '/portal';
        router.push(destination);
      } else {
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
      <Card className="p-12 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-electric-cyan border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-void-black opacity-70">Verifying your access...</p>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen pt-32 pb-20 px-4 flex items-center justify-center">
        <Card className="p-12 text-center">
          <div className="animate-spin h-12 w-12 border-4 border-electric-cyan border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-void-black opacity-70">Loading...</p>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
