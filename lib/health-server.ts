import { supabase } from './supabase/client';
import { sendSMS, NotificationTemplates } from './notifications';
import { getVehicleHealth, OPTIMAL_PROTECTION_DAYS, VehicleHealthData } from './health-algorithm';

/**
 * Send health reminder to user
 */
export const sendHealthReminder = async (
  userId: string,
  vehicleId: string,
  healthData: VehicleHealthData
): Promise<boolean> => {
  try {
    // Get user profile and vehicle details
    const [{ data: profile }, { data: vehicle }] = await Promise.all([
      supabase.from('user_profiles').select('first_name, phone').eq('user_id', userId).single(),
      supabase.from('vehicles').select('brand, model').eq('id', vehicleId).single(),
    ]);

    if (!profile || !vehicle) return false;

    const vehicleName = `${vehicle.brand} ${vehicle.model}`;
    const daysLeft = OPTIMAL_PROTECTION_DAYS - healthData.days_since_service;

    const message = NotificationTemplates.healthReminder(
      profile.first_name,
      vehicleName,
      Math.max(0, daysLeft)
    );

    return await sendSMS(profile.phone, message);
  } catch (error) {
    console.error('Error sending health reminder:', error);
    return false;
  }
};

/**
 * Batch process: Check all vehicles and send reminders
 * This should be run as a daily cron job
 */
export const processDailyHealthChecks = async (): Promise<{
  checked: number;
  notified: number;
  errors: number;
}> => {
  try {
    // Get all vehicles with completed bookings
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select('id, user_id, brand, model');

    if (error) throw error;

    let notified = 0;
    let errors = 0;

    for (const vehicle of vehicles) {
      try {
        const health = await getVehicleHealth(vehicle.id);

        if (health && health.should_notify) {
          const sent = await sendHealthReminder(vehicle.user_id, vehicle.id, health);
          if (sent) notified++;
        }
      } catch (error) {
        console.error(`Error processing vehicle ${vehicle.id}:`, error);
        errors++;
      }
    }

    return {
      checked: vehicles.length,
      notified,
      errors,
    };
  } catch (error) {
    console.error('Error in daily health checks:', error);
    return { checked: 0, notified: 0, errors: 1 };
  }
};

/**
 * Get vehicles needing service soon (for admin dashboard)
 */
export const getVehiclesNeedingService = async (): Promise<
  Array<{
    vehicle_id: string;
    user_id: string;
    brand: string;
    model: string;
    license_plate: string;
    health_score: number;
    days_since_service: number;
    user_name: string;
    user_phone: string;
  }>
> => {
  try {
    const { data: vehicles, error } = await supabase
      .from('vehicles')
      .select(`
        id,
        user_id,
        brand,
        model,
        license_plate,
        user_profiles!inner(first_name, last_name, phone)
      `);

    if (error) throw error;

    const vehiclesWithHealth = await Promise.all(
      vehicles.map(async (vehicle: any) => {
        const health = await getVehicleHealth(vehicle.id);
        const profile = Array.isArray(vehicle.user_profiles) ? vehicle.user_profiles[0] : vehicle.user_profiles;
        return {
          vehicle_id: vehicle.id,
          user_id: vehicle.user_id,
          brand: vehicle.brand,
          model: vehicle.model,
          license_plate: vehicle.license_plate,
          health_score: health?.health_score || 0,
          days_since_service: health?.days_since_service || 0,
          user_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown',
          user_phone: profile?.phone || '',
        };
      })
    );

    // Filter vehicles with health score below 40 (needs service soon)
    return vehiclesWithHealth
      .filter((v) => v.health_score < 40 && v.health_score > 0)
      .sort((a, b) => a.health_score - b.health_score);
  } catch (error) {
    console.error('Error fetching vehicles needing service:', error);
    return [];
  }
};

/**
 * Calculate potential revenue from rebooking reminders
 */
export const calculateRebookingOpportunity = async (): Promise<{
  vehicles_due: number;
  estimated_revenue: number;
  average_booking_value: number;
}> => {
  const vehiclesNeedingService = await getVehiclesNeedingService();

  // Average booking value (from pricing tiers)
  const avgBookingValue = 600; // R600 average (sedan R400, SUV R600, Luxury R800)

  return {
    vehicles_due: vehiclesNeedingService.length,
    estimated_revenue: vehiclesNeedingService.length * avgBookingValue,
    average_booking_value: avgBookingValue,
  };
};
