-- Bespoke Car Preservation Platform - Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USER PROFILES TABLE
-- =====================================================
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) NOT NULL,
  address TEXT,
  city VARCHAR(100),
  postal_code VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- VEHICLES TABLE
-- =====================================================
DROP TABLE IF EXISTS vehicles CASCADE;
CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vin VARCHAR(17),
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INTEGER,
  size_category VARCHAR(20) NOT NULL CHECK (size_category IN ('sedan', 'suv', 'luxury', 'sports')),
  color VARCHAR(50),
  license_plate VARCHAR(20) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SLOTS TABLE (Saturday availability)
-- =====================================================
DROP TABLE IF EXISTS slots CASCADE;
CREATE TABLE slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  saturday_date DATE NOT NULL,
  time_slot TIME NOT NULL,
  is_booked BOOLEAN DEFAULT FALSE,
  max_capacity INTEGER DEFAULT 1,
  current_bookings INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(saturday_date, time_slot)
);

-- =====================================================
-- SERVICE ADDONS TABLE
-- =====================================================
DROP TABLE IF EXISTS service_addons CASCADE;
CREATE TABLE service_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('protection', 'interior', 'detail', 'correction')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
DROP TABLE IF EXISTS bookings CASCADE;
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE NOT NULL,
  slot_id UUID REFERENCES slots(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled')),
  service_type VARCHAR(50) NOT NULL CHECK (service_type IN ('maintenance_refresh', 'full_preservation', 'interior_detail', 'paint_correction')),
  address TEXT NOT NULL,
  suburb VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  gate_access_notes TEXT,
  special_requests TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  addon_price DECIMAL(10, 2) DEFAULT 0,
  total_price DECIMAL(10, 2) NOT NULL,
  vat_amount DECIMAL(10, 2) NOT NULL,
  grand_total DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_reference VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- BOOKING ADDONS (Junction table)
-- =====================================================
DROP TABLE IF EXISTS booking_addons CASCADE;
CREATE TABLE booking_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL,
  addon_id UUID REFERENCES service_addons(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER DEFAULT 1,
  price_at_booking DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SERVICE HISTORY TABLE
-- =====================================================
DROP TABLE IF EXISTS service_history CASCADE;
CREATE TABLE service_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
  before_photos TEXT[], -- Array of Cloudinary URLs
  after_photos TEXT[], -- Array of Cloudinary URLs
  technician_notes TEXT,
  paint_condition VARCHAR(20) CHECK (paint_condition IN ('excellent', 'good', 'fair', 'poor')),
  swirl_marks_detected BOOLEAN DEFAULT FALSE,
  scratches_detected BOOLEAN DEFAULT FALSE,
  treatments_applied TEXT[],
  pdf_report_url TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- PRICING CONFIG TABLE
-- =====================================================
DROP TABLE IF EXISTS pricing_config CASCADE;
CREATE TABLE pricing_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sedan_price DECIMAL(10, 2) DEFAULT 400.00,
  suv_price DECIMAL(10, 2) DEFAULT 600.00,
  luxury_price DECIMAL(10, 2) DEFAULT 800.00,
  sports_price DECIMAL(10, 2) DEFAULT 750.00,
  vat_rate DECIMAL(5, 4) DEFAULT 0.15,
  effective_from DATE DEFAULT CURRENT_DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default pricing
INSERT INTO pricing_config (sedan_price, suv_price, luxury_price, sports_price, vat_rate)
VALUES (400.00, 600.00, 800.00, 750.00, 0.15);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_config ENABLE ROW LEVEL SECURITY;

-- USER PROFILES POLICIES
CREATE POLICY "Users can view their own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- VEHICLES POLICIES
CREATE POLICY "Users can view their own vehicles" ON vehicles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own vehicles" ON vehicles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own vehicles" ON vehicles
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own vehicles" ON vehicles
  FOR DELETE USING (auth.uid() = user_id);

-- BOOKINGS POLICIES
CREATE POLICY "Users can view their own bookings" ON bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings" ON bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings" ON bookings
  FOR UPDATE USING (auth.uid() = user_id);

-- BOOKING ADDONS POLICIES
CREATE POLICY "Users can view addons for their bookings" ON booking_addons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_addons.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert addons for their bookings" ON booking_addons
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_addons.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- SERVICE HISTORY POLICIES
CREATE POLICY "Users can view service history for their bookings" ON service_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = service_history.booking_id
      AND bookings.user_id = auth.uid()
    )
  );

-- SLOTS POLICIES (Public read for availability checking)
CREATE POLICY "Anyone can view available slots" ON slots
  FOR SELECT USING (true);

-- SERVICE ADDONS POLICIES (Public read)
CREATE POLICY "Anyone can view active service addons" ON service_addons
  FOR SELECT USING (is_active = true);

-- PRICING CONFIG POLICIES (Public read for active pricing)
CREATE POLICY "Anyone can view active pricing" ON pricing_config
  FOR SELECT USING (is_active = true);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_slot_id ON bookings(slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);
CREATE INDEX idx_slots_saturday_date ON slots(saturday_date);
CREATE INDEX idx_slots_is_booked ON slots(is_booked);
CREATE INDEX idx_service_history_booking_id ON service_history(booking_id);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION TO AUTOMATICALLY UPDATE SLOT CAPACITY
-- =====================================================

DROP FUNCTION IF EXISTS update_slot_capacity() CASCADE;
CREATE OR REPLACE FUNCTION update_slot_capacity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('confirmed', 'pending') THEN
    UPDATE slots
    SET current_bookings = current_bookings + 1,
        is_booked = (current_bookings + 1 >= max_capacity)
    WHERE id = NEW.slot_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status NOT IN ('confirmed', 'pending') AND NEW.status IN ('confirmed', 'pending') THEN
      UPDATE slots
      SET current_bookings = current_bookings + 1,
          is_booked = (current_bookings + 1 >= max_capacity)
      WHERE id = NEW.slot_id;
    ELSIF OLD.status IN ('confirmed', 'pending') AND NEW.status NOT IN ('confirmed', 'pending') THEN
      UPDATE slots
      SET current_bookings = GREATEST(0, current_bookings - 1),
          is_booked = (GREATEST(0, current_bookings - 1) >= max_capacity)
      WHERE id = OLD.slot_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.status IN ('confirmed', 'pending') THEN
    UPDATE slots
    SET current_bookings = GREATEST(0, current_bookings - 1),
        is_booked = (GREATEST(0, current_bookings - 1) >= max_capacity)
    WHERE id = OLD.slot_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER manage_slot_capacity
AFTER INSERT OR UPDATE OR DELETE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_slot_capacity();

-- =====================================================
-- SEED DATA: Create next 8 Saturdays with time slots
-- =====================================================

DO $$
DECLARE
  saturday_date DATE;
  time_slots TIME[] := ARRAY['09:00', '11:00', '13:00', '15:00']::TIME[];
  time_slot TIME;
  week_offset INTEGER;
BEGIN
  FOR week_offset IN 0..7 LOOP
    saturday_date := CURRENT_DATE + ((6 - EXTRACT(DOW FROM CURRENT_DATE)::INTEGER + 7) % 7 + week_offset * 7)::INTEGER;

    FOREACH time_slot IN ARRAY time_slots LOOP
      INSERT INTO slots (saturday_date, time_slot, max_capacity)
      VALUES (saturday_date, time_slot, 1)
      ON CONFLICT DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- =====================================================
-- SEED DATA: Default Service Addons
-- =====================================================

INSERT INTO service_addons (name, description, price, category) VALUES
('Ceramic Coating Boost', 'Enhanced Si02 layer for 6-month protection', 250.00, 'protection'),
('Interior Deep Clean', 'Vacuum, leather conditioning, dashboard treatment', 150.00, 'interior'),
('Wheel & Tire Detail', 'Deep clean wheels, tire shine, brake dust removal', 100.00, 'detail'),
('Glass Coating', 'Hydrophobic treatment for all windows', 120.00, 'protection'),
('Engine Bay Detail', 'Professional degreasing and protection', 180.00, 'detail'),
('Paint Correction (Minor)', 'Light swirl mark removal and polishing', 400.00, 'correction')
ON CONFLICT DO NOTHING;

-- =====================================================
-- ATOMIC BOOKING FUNCTION
-- =====================================================

DROP FUNCTION IF EXISTS create_booking_atomic(UUID, JSONB, JSONB, UUID[]) CASCADE;
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_user_id UUID,
  p_vehicle_data JSONB,
  p_booking_data JSONB,
  p_addon_ids UUID[]
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vehicle_id UUID;
  v_slot_id UUID;
  v_booking_id UUID;
  v_addon_id UUID;
  v_addon_price DECIMAL(10,2);
  v_slot_data RECORD;
BEGIN
  -- 1. Check Slot Availability
  SELECT id, is_booked, max_capacity, current_bookings
  INTO v_slot_data
  FROM slots
  WHERE saturday_date = (p_booking_data->>'saturday_date')::DATE
  AND time_slot = (p_booking_data->>'time_slot')::TIME
  FOR UPDATE; -- Lock the slot row

  IF v_slot_data.id IS NULL THEN
    RAISE EXCEPTION 'Slot not found';
  END IF;

  IF v_slot_data.is_booked OR v_slot_data.current_bookings >= v_slot_data.max_capacity THEN
    RAISE EXCEPTION 'Slot is fully booked';
  END IF;

  v_slot_id := v_slot_data.id;

  -- 2. Create or Find Vehicle
  -- Check if vehicle exists for user with same license plate
  SELECT id INTO v_vehicle_id
  FROM vehicles
  WHERE user_id = p_user_id
  AND license_plate = p_vehicle_data->>'license_plate';

  IF v_vehicle_id IS NULL THEN
    INSERT INTO vehicles (
      user_id,
      brand,
      model,
      license_plate,
      size_category,
      color,
      year
    ) VALUES (
      p_user_id,
      p_vehicle_data->>'brand',
      p_vehicle_data->>'model',
      p_vehicle_data->>'license_plate',
      p_vehicle_data->>'size_category',
      p_vehicle_data->>'color',
      (p_vehicle_data->>'year')::INTEGER
    )
    RETURNING id INTO v_vehicle_id;
  END IF;

  -- 3. Create Booking
  INSERT INTO bookings (
    user_id,
    vehicle_id,
    slot_id,
    status,
    service_type,
    address,
    suburb,
    city,
    postal_code,
    gate_access_notes,
    special_requests,
    base_price,
    addon_price,
    total_price,
    vat_amount,
    grand_total,
    payment_status
  ) VALUES (
    p_user_id,
    v_vehicle_id,
    v_slot_id,
    'pending',
    p_booking_data->>'service_type',
    p_booking_data->>'address',
    p_booking_data->>'suburb',
    p_booking_data->>'city',
    p_booking_data->>'postal_code',
    p_booking_data->>'gate_access_notes',
    p_booking_data->>'special_requests',
    (p_booking_data->>'base_price')::DECIMAL,
    (p_booking_data->>'addon_price')::DECIMAL,
    (p_booking_data->>'total_price')::DECIMAL,
    (p_booking_data->>'vat_amount')::DECIMAL,
    (p_booking_data->>'grand_total')::DECIMAL,
    'pending'
  )
  RETURNING id INTO v_booking_id;

  -- 4. Insert Addons
  IF p_addon_ids IS NOT NULL AND array_length(p_addon_ids, 1) > 0 THEN
    FOREACH v_addon_id IN ARRAY p_addon_ids LOOP
      -- Get current price
      SELECT price INTO v_addon_price FROM service_addons WHERE id = v_addon_id;
      
      INSERT INTO booking_addons (
        booking_id,
        addon_id,
        price_at_booking
      ) VALUES (
        v_booking_id,
        v_addon_id,
        v_addon_price
      );
    END LOOP;
  END IF;

  -- Slot capacity update is handled by existing trigger 'manage_slot_capacity'

  RETURN v_booking_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Booking failed: %', SQLERRM;
END;
$$;
