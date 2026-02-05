import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// Initialize Supabase with Service Role Key for admin privileges
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

// Input validation schema — prices are intentionally excluded; they are
// calculated server-side from pricing_config and service_addons.
const createBookingSchema = z.object({
  user_id: z.string().uuid(),
  vehicle_data: z.object({
    brand: z.string(),
    model: z.string(),
    license_plate: z.string(),
    size_category: z.enum(['sedan', 'suv', 'luxury', 'sports']),
  }),
  booking_data: z.object({
    saturday_date: z.string().refine((val) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
      const date = new Date(val + 'T00:00:00Z');
      if (isNaN(date.getTime())) return false;
      if (date.getUTCDay() !== 6) return false;
      const today = new Date().toISOString().split('T')[0];
      return val >= today;
    }, { message: 'Must be a valid future Saturday (YYYY-MM-DD)' }),
    time_slot: z.string(),
    service_type: z.enum(['maintenance_refresh', 'full_preservation', 'interior_detail', 'paint_correction']),
    address: z.string(),
    suburb: z.string(),
    city: z.string(),
    postal_code: z.string(),
    gate_access_notes: z.string().optional(),
    special_requests: z.string().optional(),
  }),
  addon_ids: z.array(z.string().uuid()).optional().default([]),
});

export async function POST(request: Request) {
  try {
    // 1. Authenticate the user calling the API
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

    // 2. Parse and validate request body
    const body = await request.json();
    
    // Ensure the user_id in body matches the authenticated user
    if (body.user_id !== user.id) {
      return NextResponse.json({ error: 'User mismatch' }, { status: 403 });
    }

    const validation = createBookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.format() },
        { status: 400 }
      );
    }

    const { user_id, vehicle_data, booking_data, addon_ids } = validation.data;

    // 3. Server-side price calculation — never trust client-supplied amounts
    const { data: pricingConfig, error: pricingError } = await supabaseAdmin
      .from('pricing_config')
      .select('sedan_price, suv_price, luxury_price, sports_price, vat_rate')
      .eq('is_active', true)
      .single();

    if (pricingError || !pricingConfig) {
      console.error('Pricing config error:', pricingError);
      return NextResponse.json({ error: 'Pricing configuration unavailable' }, { status: 500 });
    }

    const categoryPriceMap: Record<string, number> = {
      sedan: Number(pricingConfig.sedan_price),
      suv: Number(pricingConfig.suv_price),
      luxury: Number(pricingConfig.luxury_price),
      sports: Number(pricingConfig.sports_price),
    };

    const basePrice = categoryPriceMap[vehicle_data.size_category];

    let addonPrice = 0;
    if (addon_ids.length > 0) {
      const { data: addons, error: addonsError } = await supabaseAdmin
        .from('service_addons')
        .select('id, price')
        .in('id', addon_ids)
        .eq('is_active', true);

      if (addonsError) {
        console.error('Addons fetch error:', addonsError);
        return NextResponse.json({ error: 'Failed to validate add-ons' }, { status: 500 });
      }

      if (!addons || addons.length !== addon_ids.length) {
        return NextResponse.json({ error: 'One or more add-ons are invalid or inactive' }, { status: 400 });
      }

      addonPrice = addons.reduce((sum: number, addon: { price: number }) => sum + Number(addon.price), 0);
    }

    const totalPrice = basePrice + addonPrice;
    const vatAmount = totalPrice * Number(pricingConfig.vat_rate);
    const grandTotal = totalPrice + vatAmount;

    // 4. Ensure user profile exists (fallback if auth callback didn't create it)
    const { data: existingProfile } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', user_id)
      .single();

    if (!existingProfile) {
      // Create user profile if it doesn't exist
      await supabaseAdmin
        .from('user_profiles')
        .insert([{
          user_id: user_id,
          first_name: user.user_metadata?.first_name || '',
          last_name: user.user_metadata?.last_name || '',
          phone: user.user_metadata?.phone || '',
          email: user.email || '',
          address: user.user_metadata?.address || null,
          city: user.user_metadata?.city || null,
          postal_code: user.user_metadata?.postal_code || null,
        }])
        .select('id')
        .single();
    }

    // 5. Merge server-calculated prices into booking_data for the stored procedure
    const bookingDataWithPrices = {
      ...booking_data,
      base_price: basePrice,
      addon_price: addonPrice,
      total_price: totalPrice,
      vat_amount: vatAmount,
      grand_total: grandTotal,
    };

    // 6. Call the atomic stored procedure
    const { data, error } = await supabaseAdmin.rpc('create_booking_atomic', {
      p_user_id: user_id,
      p_vehicle_data: vehicle_data,
      p_booking_data: bookingDataWithPrices,
      p_addon_ids: addon_ids
    });

    if (error) {
      console.error('Booking creation error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to create booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      booking_id: data,
      amount: grandTotal,
      status: 'pending'
    });

  } catch (err: any) {
    console.error('Server error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
