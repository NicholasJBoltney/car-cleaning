-- Referral Program Schema Extension

-- =====================================================
-- REFERRAL CODES TABLE
-- =====================================================
DROP TABLE IF EXISTS referral_codes CASCADE;
CREATE TABLE referral_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  code VARCHAR(20) UNIQUE NOT NULL,
  uses_count INTEGER DEFAULT 0,
  credit_earned DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- REFERRALS TABLE (tracks who referred whom)
-- =====================================================
DROP TABLE IF EXISTS referrals CASCADE;
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  referral_code VARCHAR(20) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'credited')),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  referrer_credit DECIMAL(10, 2) DEFAULT 200.00,
  referred_credit DECIMAL(10, 2) DEFAULT 200.00,
  credited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(referred_user_id) -- Each user can only be referred once
);

-- =====================================================
-- CREDITS TABLE (wallet system)
-- =====================================================
DROP TABLE IF EXISTS user_credits CASCADE;
CREATE TABLE user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  lifetime_earned DECIMAL(10, 2) DEFAULT 0.00,
  lifetime_spent DECIMAL(10, 2) DEFAULT 0.00,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CREDIT TRANSACTIONS TABLE
-- =====================================================
DROP TABLE IF EXISTS credit_transactions CASCADE;
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'spent', 'expired', 'bonus')),
  source VARCHAR(50) NOT NULL CHECK (source IN ('referral', 'booking', 'promotion', 'ambassador', 'gift')),
  description TEXT,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  referral_id UUID REFERENCES referrals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- AMBASSADOR PROGRAM TABLE
-- =====================================================
DROP TABLE IF EXISTS ambassadors CASCADE;
CREATE TABLE ambassadors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  estate_name VARCHAR(200),
  tier VARCHAR(20) DEFAULT 'bronze' CHECK (tier IN ('bronze', 'silver', 'gold', 'platinum')),
  total_referrals INTEGER DEFAULT 0,
  active_referrals INTEGER DEFAULT 0,
  commission_rate DECIMAL(5, 4) DEFAULT 0.10, -- 10%
  total_earned DECIMAL(10, 2) DEFAULT 0.00,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ambassadors ENABLE ROW LEVEL SECURITY;

-- Referral Codes
CREATE POLICY "Users can view their own referral codes" ON referral_codes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral codes" ON referral_codes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Credits
CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Credit Transactions
CREATE POLICY "Users can view their own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Referrals
CREATE POLICY "Users can view referrals they made" ON referrals
  FOR SELECT USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

-- Ambassadors
CREATE POLICY "Users can view their own ambassador profile" ON ambassadors
  FOR SELECT USING (auth.uid() = user_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate unique referral code
DROP FUNCTION IF EXISTS generate_referral_code(UUID) CASCADE;
CREATE OR REPLACE FUNCTION generate_referral_code(p_user_id UUID)
RETURNS VARCHAR AS $$
DECLARE
  v_code VARCHAR(20);
  v_exists BOOLEAN;
  v_first_name VARCHAR;
BEGIN
  -- Get user's first name
  SELECT first_name INTO v_first_name
  FROM user_profiles
  WHERE user_id = p_user_id
  LIMIT 1;

  -- Generate code based on name + random string
  LOOP
    v_code := UPPER(SUBSTRING(COALESCE(v_first_name, 'USER'), 1, 4) || SUBSTRING(MD5(RANDOM()::TEXT), 1, 6));

    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = v_code) INTO v_exists;

    EXIT WHEN NOT v_exists;
  END LOOP;

  RETURN v_code;
END;
$$ LANGUAGE plpgsql;

-- Function to process referral credit
DROP FUNCTION IF EXISTS process_referral_credit(UUID) CASCADE;
CREATE OR REPLACE FUNCTION process_referral_credit(p_referral_id UUID)
RETURNS VOID AS $$
DECLARE
  v_referral RECORD;
BEGIN
  SELECT * INTO v_referral FROM referrals WHERE id = p_referral_id;

  IF v_referral.status = 'completed' THEN
    -- Credit the referrer
    INSERT INTO user_credits (user_id, balance, lifetime_earned)
    VALUES (v_referral.referrer_user_id, v_referral.referrer_credit, v_referral.referrer_credit)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = user_credits.balance + v_referral.referrer_credit,
        lifetime_earned = user_credits.lifetime_earned + v_referral.referrer_credit,
        updated_at = NOW();

    -- Credit the referred user
    INSERT INTO user_credits (user_id, balance, lifetime_earned)
    VALUES (v_referral.referred_user_id, v_referral.referred_credit, v_referral.referred_credit)
    ON CONFLICT (user_id) DO UPDATE
    SET balance = user_credits.balance + v_referral.referred_credit,
        lifetime_earned = user_credits.lifetime_earned + v_referral.referred_credit,
        updated_at = NOW();

    -- Create transaction records
    INSERT INTO credit_transactions (user_id, amount, type, source, description, referral_id)
    VALUES
      (v_referral.referrer_user_id, v_referral.referrer_credit, 'earned', 'referral', 'Referral reward', p_referral_id),
      (v_referral.referred_user_id, v_referral.referred_credit, 'earned', 'referral', 'New user referral bonus', p_referral_id);

    -- Update referral status
    UPDATE referrals
    SET status = 'credited', credited_at = NOW()
    WHERE id = p_referral_id;

    -- Update referral code usage
    UPDATE referral_codes
    SET uses_count = uses_count + 1,
        credit_earned = credit_earned + v_referral.referrer_credit
    WHERE code = v_referral.referral_code;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to apply credit to booking
DROP FUNCTION IF EXISTS apply_credit_to_booking(UUID, UUID, DECIMAL) CASCADE;
CREATE OR REPLACE FUNCTION apply_credit_to_booking(p_user_id UUID, p_booking_id UUID, p_amount DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
  v_available_credit DECIMAL;
BEGIN
  SELECT balance INTO v_available_credit FROM user_credits WHERE user_id = p_user_id;

  IF v_available_credit IS NULL OR v_available_credit < p_amount THEN
    RETURN FALSE;
  END IF;

  -- Deduct credit
  UPDATE user_credits
  SET balance = balance - p_amount,
      lifetime_spent = lifetime_spent + p_amount,
      updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Record transaction
  INSERT INTO credit_transactions (user_id, amount, type, source, description, booking_id)
  VALUES (p_user_id, p_amount, 'spent', 'booking', 'Applied to booking payment', p_booking_id);

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Automatically create referral code for new users
DROP FUNCTION IF EXISTS create_default_referral_code() CASCADE;
CREATE OR REPLACE FUNCTION create_default_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO referral_codes (user_id, code)
  VALUES (NEW.user_id, generate_referral_code(NEW.user_id));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_referral_code_on_profile
AFTER INSERT ON user_profiles
FOR EACH ROW EXECUTE FUNCTION create_default_referral_code();

-- Auto-credit referrals when referred user completes first booking
DROP FUNCTION IF EXISTS check_referral_completion() CASCADE;
CREATE OR REPLACE FUNCTION check_referral_completion()
RETURNS TRIGGER AS $$
DECLARE
  v_referral_id UUID;
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    SELECT id INTO v_referral_id
    FROM referrals
    WHERE referred_user_id = NEW.user_id
      AND status = 'pending'
    LIMIT 1;

    IF v_referral_id IS NOT NULL THEN
      UPDATE referrals
      SET status = 'completed', booking_id = NEW.id
      WHERE id = v_referral_id;

      PERFORM process_referral_credit(v_referral_id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_referral_on_booking_payment
AFTER UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION check_referral_completion();

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_referral_codes_user_id ON referral_codes(user_id);
CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referrals_referrer ON referrals(referrer_user_id);
CREATE INDEX idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
