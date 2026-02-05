// User and Profile Types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  address?: string;
  city?: string;
  postal_code?: string;
  created_at: string;
  updated_at: string;
}

// Vehicle Types
export type VehicleSizeCategory = 'sedan' | 'suv' | 'luxury' | 'sports';

export interface Vehicle {
  id: string;
  user_id: string;
  vin?: string;
  brand: string;
  model: string;
  year?: number;
  size_category: VehicleSizeCategory;
  color?: string;
  license_plate: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Booking and Slot Types
export type BookingStatus = 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type ServiceType = 'maintenance_refresh' | 'full_preservation' | 'interior_detail' | 'paint_correction';

export interface Slot {
  id: string;
  saturday_date: string; // ISO date string
  time_slot: string; // e.g., "09:00", "11:00", "13:00"
  is_booked: boolean;
  max_capacity: number;
  current_bookings: number;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  vehicle_id: string;
  slot_id: string;
  status: BookingStatus;
  service_type: ServiceType;
  address: string;
  suburb: string;
  city: string;
  postal_code: string;
  gate_access_notes?: string;
  special_requests?: string;
  base_price: number;
  addon_price: number;
  total_price: number;
  vat_amount: number;
  grand_total: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_reference?: string;
  created_at: string;
  updated_at: string;
  // Populated relations
  vehicle?: Vehicle;
  slot?: Slot;
  user_profile?: UserProfile;
}

// Service History Types
export interface ServiceHistory {
  id: string;
  booking_id: string;
  before_photos: string[]; // Cloudinary URLs
  after_photos: string[]; // Cloudinary URLs
  technician_notes: string;
  paint_condition: 'excellent' | 'good' | 'fair' | 'poor';
  swirl_marks_detected: boolean;
  scratches_detected: boolean;
  treatments_applied: string[];
  pdf_report_url?: string;
  completed_at: string;
  created_at: string;
  // Populated relations
  booking?: Booking;
}

// Add-on Services
export interface ServiceAddon {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'protection' | 'interior' | 'detail' | 'correction';
  is_active: boolean;
}

export interface BookingAddon {
  id: string;
  booking_id: string;
  addon_id: string;
  quantity: number;
  price_at_booking: number;
}

// Pricing Configuration
export interface PricingConfig {
  sedan: number;
  suv: number;
  luxury: number;
  sports: number;
  vat_rate: number; // e.g., 0.15 for 15%
}

// Booking Form State (for multi-step form)
export interface BookingFormData {
  // Step 1: Vehicle
  vehicle_id?: string;
  new_vehicle?: {
    brand: string;
    model: string;
    year?: number;
    size_category: VehicleSizeCategory;
    color?: string;
    license_plate: string;
  };

  // Step 2: Date & Time
  slot_id?: string;
  saturday_date?: string;
  time_slot?: string;

  // Step 3: Service
  service_type: ServiceType;
  selected_addons: string[]; // addon IDs

  // Step 4: Location
  address: string;
  suburb: string;
  city: string;
  postal_code: string;
  gate_access_notes?: string;
  special_requests?: string;

  // Contact Info
  first_name: string;
  last_name: string;
  email: string;
  phone: string;

  // Pricing summary
  base_price: number;
  addon_price: number;
  total_price: number;
  vat_amount: number;
  grand_total: number;
}

// Admin Dashboard Types
export interface DayRunSheet {
  date: string;
  bookings: Booking[];
  total_revenue: number;
  optimized_route?: {
    booking_id: string;
    order: number;
    estimated_travel_time: number;
  }[];
}

// Weather API Response
export interface WeatherData {
  date: string;
  condition: string;
  temperature: number;
  precipitation_probability: number;
  wind_speed: number;
  is_suitable_for_service: boolean;
}

// Notification Types
export interface NotificationTemplate {
  type: 'booking_confirmation' | 'pre_arrival' | 'completion' | 'rescheduling';
  subject: string;
  body: string;
}

// Analytics Types
export interface VehicleHealthScore {
  vehicle_id: string;
  current_score: number; // 0-100
  days_since_last_service: number;
  decay_rate: number; // percentage per day
  next_recommended_service: string; // ISO date
}
