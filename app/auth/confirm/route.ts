import { type EmailOtpType } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  console.log('🔐 [AUTH CONFIRM] Request received');
  console.log('🔐 [AUTH CONFIRM] Full URL:', request.url);
  
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const token = searchParams.get('token'); // Old-style magic link
  const type = searchParams.get('type') as EmailOtpType | null;
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/portal';

  console.log('🔐 [AUTH CONFIRM] Parameters:', {
    token_hash: token_hash ? `${token_hash.substring(0, 20)}...` : null,
    token: token ? `${token.substring(0, 20)}...` : null,
    type,
    code: code ? `${code.substring(0, 20)}...` : null,
    next,
  });

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('token');
  redirectTo.searchParams.delete('type');

  // Handle old-style magic link with 'token' parameter
  if (token && type) {
    console.log('🔐 [AUTH CONFIRM] Attempting old-style magic link verification');
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: token,
    });

    if (error) {
      console.error('❌ [AUTH CONFIRM] Old-style verification failed:', error.message);
    } else {
      console.log('✅ [AUTH CONFIRM] Old-style verification successful');
      console.log('✅ [AUTH CONFIRM] Session:', data.session ? 'Created' : 'None');
      redirectTo.searchParams.delete('next');
      return NextResponse.redirect(redirectTo);
    }
  }

  // Handle token_hash (OTP verification)
  if (token_hash && type) {
    console.log('🔐 [AUTH CONFIRM] Attempting OTP verification with token_hash');
    const supabase = await createClient();

    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      console.error('❌ [AUTH CONFIRM] OTP verification failed:', error.message);
    } else {
      console.log('✅ [AUTH CONFIRM] OTP verification successful');
      console.log('✅ [AUTH CONFIRM] Session:', data.session ? 'Created' : 'None');
      redirectTo.searchParams.delete('next');
      return NextResponse.redirect(redirectTo);
    }
  }

  // Handle PKCE code exchange if present
  if (code) {
    console.log('🔐 [AUTH CONFIRM] Attempting PKCE code exchange');
    const supabase = await createClient();
    
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error) {
      console.error('❌ [AUTH CONFIRM] PKCE exchange failed:', error.message);
      console.error('❌ [AUTH CONFIRM] Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ [AUTH CONFIRM] PKCE exchange successful');
      console.log('✅ [AUTH CONFIRM] Session:', data.session ? 'Created' : 'None');
      console.log('✅ [AUTH CONFIRM] User:', data.user?.email);
      redirectTo.searchParams.delete('code');
      return NextResponse.redirect(redirectTo);
    }
  }

  // Return the user to an error page with some instructions
  console.log('❌ [AUTH CONFIRM] No valid auth parameters found, redirecting to login');
  redirectTo.pathname = '/auth/login';
  redirectTo.searchParams.set('error', 'Token has expired or is invalid. Please try again.');
  return NextResponse.redirect(redirectTo);
}
