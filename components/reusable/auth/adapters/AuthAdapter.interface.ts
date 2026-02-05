export interface AuthSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: Record<string, any>;
  };
  access_token: string;
}

export interface AuthAdapter {
  signInWithEmail(email: string, redirectTo?: string): Promise<{ error: Error | null }>;
  getSession(): Promise<{ session: AuthSession | null; error: Error | null }>;
  signOut(): Promise<{ error: Error | null }>;
  onAuthStateChange(callback: (event: string, session: AuthSession | null) => void): { unsubscribe: () => void };
}
