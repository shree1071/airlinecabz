interface BookingData {
  id: string;
  customer_name: string;
  customer_phone: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  vehicle_type: string;
  total_amount: number;
  status: string;
}

interface WhatsAppTemplateMessage {
  messaging_product: "whatsapp";
  to: string;
  type: "template";
  template: {
    name: string;
    language: {
      code: string;
    };
    components: Array<{
      type: string;
      parameters: Array<{
        type: string;
        text: string;
      }>;
    }>;
  };
}

export async function sendWhatsAppNotification(phoneNumber: string, booking: BookingData) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    console.error("WhatsApp credentials not configured");
    throw new Error("WhatsApp credentials not configured");
  }

  // Format phone number (remove any non-digits and ensure it starts with country code)
  const formattedPhone = formatPhoneNumber(phoneNumber);
  
  // Format pickup date and time separately
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

  // Create template message
  const message: WhatsAppTemplateMessage = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "template",
    template: {
      name: "booking_confirmation", // This should match your template name in Meta Business Manager
      language: {
        code: "en_US"
      },
      components: [
        {
          type: "body",
          parameters: [
            {
              type: "text",
              text: booking.customer_name
            },
            {
              type: "text",
              text: booking.id
            },
            {
              type: "text",
              text: booking.pickup_location
            },
            {
              type: "text",
              text: booking.dropoff_location
            },
            {
              type: "text",
              text: pickupDate
            },
            {
              type: "text",
              text: pickupTime
            },
            {
              type: "text",
              text: booking.vehicle_type
            },
            {
              type: "text",
              text: `₹${booking.total_amount}`
            }
          ]
        }
      ]
    }
  };

  try {
    console.log(`Sending WhatsApp notification to ${formattedPhone} for booking ${booking.id}`);
    
    const response = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', result);
      
      // If template not found, try sending a simple text message as fallback
      if (result.error?.code === 132000 || result.error?.message?.includes('template')) {
        console.log('Template not found, sending simple text message as fallback');
        return await sendBookingConfirmationText(formattedPhone, booking);
      }
      
      throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
    }

    console.log('WhatsApp message sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}

// Fallback function to send simple text message if template fails
async function sendBookingConfirmationText(phoneNumber: string, booking: BookingData) {
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

  const message = `Booking Confirmed

Hello ${booking.customer_name},

Your booking has been confirmed.

Booking ID: ${booking.id}
From: ${booking.pickup_location}
To: ${booking.dropoff_location}
Date: ${pickupDate}
Time: ${pickupTime}
Vehicle: ${booking.vehicle_type}
Total Amount: ₹${booking.total_amount}

We will contact you 30 minutes before pickup. Have a safe journey.

Thank you for choosing Airlinecabz.`;

  return await sendSimpleWhatsAppMessage(phoneNumber, message);
}

function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 91, it's already formatted for India
  if (cleaned.startsWith('91')) {
    return cleaned;
  }
  
  // If it starts with 0, remove it and add 91
  if (cleaned.startsWith('0')) {
    return '91' + cleaned.substring(1);
  }
  
  // If it's 10 digits, assume it's Indian number and add 91
  if (cleaned.length === 10) {
    return '91' + cleaned;
  }
  
  return cleaned;
}

// Alternative function to send simple text message (for testing)
export async function sendSimpleWhatsAppMessage(phoneNumber: string, message: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp credentials not configured");
  }

  const formattedPhone = formatPhoneNumber(phoneNumber);

  const payload = {
    messaging_product: "whatsapp",
    to: formattedPhone,
    type: "text",
    text: {
      body: message
    }
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v25.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', result);
      throw new Error(`WhatsApp API error: ${result.error?.message || 'Unknown error'}`);
    }

    return result;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    throw error;
  }
}