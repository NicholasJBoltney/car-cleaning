import { SupabaseClient } from '@supabase/supabase-js';
import { AuthAdapter, AuthSession } from './AuthAdapter.interface';

export class SupabaseAuthAdapter implements AuthAdapter {
  constructor(private supabase: SupabaseClient) {}

  async signInWithEmail(email: string, redirectTo?: string) {
    // Redirect to /auth/callback and pass the final destination
    const callbackUrl = new URL('/auth/callback', window.location.origin);
    if (redirectTo) {
      callbackUrl.searchParams.set('next', redirectTo);
    }

    const { error } = await this.supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl.toString(),
      },
    });
    return { error };
  }

  async getSession() {
    const { data, error } = await this.supabase.auth.getSession();
    if (error) return { session: null, error };
    
    // Map Supabase session to generic AuthSession
    const session: AuthSession | null = data.session ? {
      user: {
        id: data.session.user.id,
        email: data.session.user.email,
        user_metadata: data.session.user.user_metadata,
      },
      access_token: data.session.access_token,
    } : null;

    return { session, error: null };
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    return { error };
  }

  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void) {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((event, session) => {
      const mappedSession: AuthSession | null = session ? {
        user: {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        },
        access_token: session.access_token,
      } : null;
      callback(event, mappedSession);
    });

    return { unsubscribe: () => subscription.unsubscribe() };
  }
}
