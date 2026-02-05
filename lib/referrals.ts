import { supabase } from './supabase/client';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  uses_count: number;
  credit_earned: number;
  is_active: boolean;
  created_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  balance: number;
  lifetime_earned: number;
  lifetime_spent: number;
}

export interface Referral {
  id: string;
  referrer_user_id: string;
  referred_user_id: string;
  referral_code: string;
  status: 'pending' | 'completed' | 'credited';
  referrer_credit: number;
  referred_credit: number;
  created_at: string;
}

export const getReferralCode = async (userId: string): Promise<ReferralCode | null> => {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error
    return data || null;
  } catch (error) {
    console.error('Error fetching referral code:', error);
    return null;
  }
};

export const getUserCredits = async (userId: string): Promise<UserCredits | null> => {
  try {
    const { data, error } = await supabase
      .from('user_credits')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // Ignore "not found" error

    return data || { balance: 0, lifetime_earned: 0, lifetime_spent: 0 } as any;
  } catch (error) {
    console.error('Error fetching user credits:', error);
    return null;
  }
};

export const getMyReferrals = async (userId: string): Promise<Referral[]> => {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*')
      .eq('referrer_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return [];
  }
};

export const validateReferralCode = async (code: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('referral_codes')
      .select('is_active')
      .eq('code', code.toUpperCase())
      .single();

    if (error) return false;
    return data?.is_active || false;
  } catch (error) {
    return false;
  }
};

export const applyReferralCode = async (
  referralCode: string,
  newUserId: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Validate code exists and is active
    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('user_id, is_active')
      .eq('code', referralCode.toUpperCase())
      .single();

    if (codeError || !codeData) {
      return { success: false, message: 'Invalid referral code' };
    }

    if (!codeData.is_active) {
      return { success: false, message: 'This referral code is no longer active' };
    }

    if (codeData.user_id === newUserId) {
      return { success: false, message: 'You cannot use your own referral code' };
    }

    // Check if user was already referred
    const { data: existingReferral } = await supabase
      .from('referrals')
      .select('id')
      .eq('referred_user_id', newUserId)
      .single();

    if (existingReferral) {
      return { success: false, message: 'You have already used a referral code' };
    }

    // Create referral record
    const { error: insertError } = await supabase.from('referrals').insert({
      referrer_user_id: codeData.user_id,
      referred_user_id: newUserId,
      referral_code: referralCode.toUpperCase(),
      status: 'pending',
      referrer_credit: 200.0,
      referred_credit: 200.0,
    });

    if (insertError) throw insertError;

    return {
      success: true,
      message: 'Referral code applied! You\'ll receive R200 credit after your first booking.',
    };
  } catch (error) {
    console.error('Error applying referral code:', error);
    return { success: false, message: 'Failed to apply referral code' };
  }
};

export const generateReferralLink = (code: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return `${baseUrl}/book?ref=${code}`;
};

export const getReferralStats = async (userId: string) => {
  try {
    const [referrals, credits, code] = await Promise.all([
      getMyReferrals(userId),
      getUserCredits(userId),
      getReferralCode(userId),
    ]);

    const completedReferrals = referrals.filter((r) => r.status === 'credited').length;
    const pendingReferrals = referrals.filter((r) => r.status === 'pending' || r.status === 'completed').length;

    return {
      code: code?.code || '',
      totalReferrals: referrals.length,
      completedReferrals,
      pendingReferrals,
      creditsBalance: credits?.balance || 0,
      lifetimeEarned: credits?.lifetime_earned || 0,
      referralLink: code ? generateReferralLink(code.code) : '',
    };
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    return null;
  }
};
