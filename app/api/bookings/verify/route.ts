import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { sendSMS, NotificationTemplates } from '@/lib/notifications';

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
    // 1. Authenticate Request
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');

    // Create a client with the user's token to verify it
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
      console.error('Auth error:', authError);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. Get params
    const { reference, booking_id } = await request.json();

    if (!reference || !booking_id) {
      return NextResponse.json({ error: 'Missing reference or booking_id' }, { status: 400 });
    }

    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(booking_id)) {
      return NextResponse.json({ error: 'Invalid booking_id' }, { status: 400 });
    }

    // 3. Verify booking ownership and details
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .select('user_id, grand_total, status, slot:slots(saturday_date, time_slot)')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    if (booking.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized access to booking' }, { status: 403 });
    }

    // Idempotency check
    if (booking.status === 'confirmed') {
      return NextResponse.json({ success: true, message: 'Already confirmed' });
    }

    // 4. Verify with Paystack
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecret) {
      console.error('PAYSTACK_SECRET_KEY is not set');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
      },
    });

    if (!verifyResponse.ok) {
      return NextResponse.json({ error: 'Payment provider unavailable' }, { status: 502 });
    }

    const verifyData = await verifyResponse.json();

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // 5. Verify Amount (Paystack amount is in cents)
    const paidAmount = verifyData.data.amount / 100;
    // Allow for small floating point differences
    if (Math.abs(paidAmount - booking.grand_total) > 0.01) {
      return NextResponse.json({ error: 'Payment amount does not match booking' }, { status: 400 });
    }

    // 6. Update Booking
    const { error: updateError } = await supabaseAdmin
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'paid',
        payment_reference: reference, // specific column for this reference if exists, or store in metadata
        updated_at: new Date().toISOString()
      })
      .eq('id', booking_id);

    if (updateError) {
      console.error('Failed to update booking:', updateError);
      return NextResponse.json({ error: 'Failed to update booking status' }, { status: 500 });
    }

    // 7. Send confirmation SMS
    try {
      const { data: userProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('first_name, phone')
        .eq('user_id', user.id)
        .single();

      if (userProfile?.phone) {
        const slotData = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot;
        const message = NotificationTemplates.bookingConfirmation(
          userProfile.first_name || 'Client',
          slotData?.saturday_date || 'your booked date',
          slotData?.time_slot || 'your booked time'
        );
        await sendSMS(userProfile.phone, message);
      }
    } catch (smsError) {
      console.error('SMS notification failed (non-blocking):', smsError);
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Verify error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
