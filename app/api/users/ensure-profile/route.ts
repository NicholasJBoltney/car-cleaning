import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: Request) {
  try {
    // Authenticate the user making the request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token
    const userClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if user profile already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingProfile) {
      // Profile already exists
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        profile_id: existingProfile.id
      });
    }

    // Create user profile with data from auth user metadata
    const { data: { user: fullUser } } = await userClient.auth.getUser();

    const profileData = {
      user_id: user.id,
      first_name: fullUser?.user_metadata?.first_name || '',
      last_name: fullUser?.user_metadata?.last_name || '',
      phone: fullUser?.user_metadata?.phone || '',
      email: user.email || '',
      address: fullUser?.user_metadata?.address || null,
      city: fullUser?.user_metadata?.city || null,
      postal_code: fullUser?.user_metadata?.postal_code || null,
    };

    const { data: newProfile, error: insertError } = await supabaseAdmin
      .from('user_profiles')
      .insert([profileData])
      .select('id')
      .single();

    if (insertError) {
      console.error('Failed to create user profile:', insertError);
      // Don't fail the entire auth flow if profile creation fails
      // The profile can be created later
      return NextResponse.json({
        success: true,
        message: 'Auth successful but profile creation had issues',
        profile_id: null
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Profile created successfully',
      profile_id: newProfile?.id
    });

  } catch (err: any) {
    console.error('Error ensuring user profile:', err);
    // Return success anyway to not block auth flow
    return NextResponse.json({
      success: true,
      message: 'Auth successful',
      error: err.message
    });
  }
}
