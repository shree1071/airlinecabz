import { Booking, toNumber } from "@/types";

/**
 * Generate WhatsApp Web URL with pre-filled booking confirmation message
 * This is a workaround for sending messages before WhatsApp Business API production access
 */
export function generateWhatsAppLink(booking: Booking): string {
  // Format phone number (remove non-digits)
  const phoneNumber = booking.customer_phone.replace(/\D/g, '');
  
  // Format date and time separately
  const pickupDateTime = new Date(booking.pickup_date);
  const pickupDate = pickupDateTime.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const pickupTime = pickupDateTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Create confirmation message (matches template format)
  const message = `Hello ${booking.customer_name},

Your booking has been confirmed.

Booking ID: ${booking.id}
From: ${booking.pickup_location}
To: ${booking.dropoff_location}
Date: ${pickupDate}
Time: ${pickupTime}
Vehicle: ${booking.vehicle_type}
Total Amount: ₹${toNumber(booking.total_amount)}

We will contact you 30 minutes before pickup. Have a safe journey.

Thank you for choosing Airlinecabz.`;

  // Generate WhatsApp Web URL
  return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Generate WhatsApp link for any custom message
 */
export function generateCustomWhatsAppLink(phoneNumber: string, message: string): string {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
