'use client';

import { AuthGate } from '@/components/reusable/auth/AuthGate';
import { SupabaseAuthAdapter } from '@/components/reusable/auth/adapters/SupabaseAuthAdapter';
import { supabase } from '@/lib/supabase/client';

export default function BookingAuthPage() {
  return (
    <AuthGate
      config={{
        provider: 'supabase',
        authAdapter: new SupabaseAuthAdapter(supabase),
        title: 'Welcome to Bespoke Car Preservation',
        subtitle: 'Sign in to book your premium service',
        redirectOnSuccess: '/book',
        requireTerms: true,
        termsUrl: '/terms',
        theme: {
          primaryColor: '#E6B31E',
          backgroundColor: '#0A0A0F'
        }
      }}
    />
  );
}
