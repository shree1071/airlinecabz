// Centralized type definitions to avoid type inconsistencies

export type VehicleCategory = 'airport' | 'outstation' | 'local';

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export type TripType = 'to_airport' | 'from_airport';

export type Terminal = 'terminal1' | 'terminal2';

// Vehicle type with proper handling of numeric fields from database
export interface Vehicle {
  id: string;
  name: string;
  slug: string;
  base_fare: number | string; // PostgreSQL NUMERIC returns as string
  per_km_rate: number | string; // PostgreSQL NUMERIC returns as string
  image_url: string;
  is_ev: boolean;
  is_active: boolean;
  sort_order: number;
  capacity: string;
  vehicle_category: VehicleCategory;
  created_at?: string;
  updated_at?: string;
}

// Booking type
export interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  trip_type: TripType;
  terminal: Terminal;
  pickup_location: string;
  dropoff_location: string;
  address_line1?: string;
  address_line2?: string;
  landmark?: string;
  area?: string;
  pincode?: string;
  pickup_date: string;
  vehicle_type: string;
  base_fare: number | string;
  taxes: number | string;
  total_amount: number | string;
  status: BookingStatus;
  distance_km?: number;
  duration_minutes?: number;
  created_at: string;
  updated_at?: string;
}

// Helper functions to safely convert database numeric strings to numbers
export const toNumber = (value: number | string | null | undefined, defaultValue: number = 0): number => {
  if (value === null || value === undefined) return defaultValue;
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return isNaN(num) ? defaultValue : num;
};

// Format currency
export const formatCurrency = (value: number | string | null | undefined): string => {
  const num = toNumber(value);
  return `₹${num.toLocaleString('en-IN')}`;
};

// Validate vehicle data before saving
export const validateVehicle = (data: Partial<Vehicle>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!data.name?.trim()) errors.push('Vehicle name is required');
  if (!data.slug?.trim()) errors.push('Vehicle slug is required');
  if (!data.capacity?.trim()) errors.push('Capacity is required');
  if (!data.vehicle_category) errors.push('Vehicle category is required');
  
  const baseFare = toNumber(data.base_fare);
  const perKmRate = toNumber(data.per_km_rate);
  
  // Validation based on category
  if (data.vehicle_category === 'airport' && baseFare <= 0) {
    errors.push('Airport vehicles must have a base fare greater than 0');
  }
  
  if (data.vehicle_category === 'outstation' && perKmRate <= 0) {
    errors.push('Outstation vehicles must have a per km rate greater than 0');
  }
  
  if (data.vehicle_category === 'local' && baseFare <= 0) {
    errors.push('Local vehicles must have a base fare greater than 0');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};
