import { supabase } from './supabase/client';

export interface VehicleHealthData {
  vehicle_id: string;
  last_service_date: string | null;
  days_since_service: number;
  health_score: number; // 0-100
  decay_rate: number; // percentage per day
  status: 'excellent' | 'good' | 'fair' | 'critical';
  next_recommended_service: string;
  should_notify: boolean;
}

// Constants for decay calculation
export const OPTIMAL_PROTECTION_DAYS = 21; // Polymer protection optimal for 21 days
const BASE_DECAY_RATE = 4.76; // 100 / 21 = ~4.76% per day
const WEATHER_FACTOR_MULTIPLIER = 1.2; // Accelerated decay in harsh weather
const USAGE_FACTOR_MULTIPLIER = 1.15; // Faster decay with frequent use

/**
 * Calculate vehicle health score based on last service date
 * Uses exponential decay model for realistic degradation
 */
export const calculateHealthScore = (
  daysSinceService: number,
  weatherFactor: number = 1.0,
  usageFactor: number = 1.0
): number => {
  if (daysSinceService <= 0) return 100;

  // Apply exponential decay with environmental factors
  const adjustedDecayRate = BASE_DECAY_RATE * weatherFactor * usageFactor;
  const decayFactor = Math.pow(0.95, daysSinceService); // 5% compound decay per day
  const linearDecay = Math.max(0, 100 - (daysSinceService * adjustedDecayRate));

  // Blend exponential and linear decay for more realistic curve
  const score = (decayFactor * 50) + (linearDecay * 0.5);

  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * Get health status based on score
 */
export const getHealthStatus = (score: number): 'excellent' | 'good' | 'fair' | 'critical' => {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 30) return 'fair';
  return 'critical';
};

/**
 * Calculate next recommended service date
 */
export const calculateNextServiceDate = (lastServiceDate: Date): string => {
  const nextDate = new Date(lastServiceDate);
  nextDate.setDate(nextDate.getDate() + OPTIMAL_PROTECTION_DAYS);
  return nextDate.toISOString().split('T')[0];
};

/**
 * Get vehicle health data
 */
export const getVehicleHealth = async (vehicleId: string): Promise<VehicleHealthData | null> => {
  try {
    // Get last completed booking for this vehicle
    const { data: booking, error } = await supabase
      .from('bookings')
      .select('updated_at')
      .eq('vehicle_id', vehicleId)
      .eq('status', 'completed')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    const lastServiceDate = booking?.updated_at || null;
    const daysSinceService = lastServiceDate
      ? Math.floor((Date.now() - new Date(lastServiceDate).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const healthScore = calculateHealthScore(daysSinceService);
    const status = getHealthStatus(healthScore);
    const nextRecommendedService = lastServiceDate
      ? calculateNextServiceDate(new Date(lastServiceDate))
      : new Date().toISOString().split('T')[0];

    const shouldNotify = daysSinceService >= 18 && daysSinceService <= 22; // Notify in optimal rebooking window

    return {
      vehicle_id: vehicleId,
      last_service_date: lastServiceDate,
      days_since_service: daysSinceService,
      health_score: healthScore,
      decay_rate: BASE_DECAY_RATE,
      status,
      next_recommended_service: nextRecommendedService,
      should_notify: shouldNotify,
    };
  } catch (error) {
    console.error('Error calculating vehicle health:', error);
    return null;
  }
};

/**
 * Get health data for all user vehicles
 */
export const getUserVehiclesHealth = async (userId: string): Promise<VehicleHealthData[]> => {
  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id')
      .eq('user_id', userId);

    if (error) throw error;

    const healthData = await Promise.all(
      vehicles.map((vehicle) => getVehicleHealth(vehicle.id))
    );

    return healthData.filter((data): data is VehicleHealthData => data !== null);
  } catch (error) {
    console.error('Error fetching user vehicles health:', error);
    return [];
  }
};


