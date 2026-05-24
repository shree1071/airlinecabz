import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();

    if (!phoneNumber) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!accessToken || !phoneNumberId) {
      return NextResponse.json(
        { error: "WhatsApp credentials not configured" },
        { status: 500 }
      );
    }

    // Format phone number
    let formattedPhone = phoneNumber.replace(/\s/g, '').replace(/\D/g, '');
    if (!formattedPhone.startsWith('91') && formattedPhone.length === 10) {
      formattedPhone = '91' + formattedPhone;
    }

    console.log(`Testing booking_confirmation template to ${formattedPhone}`);

    // Sample booking data for testing
    const testBooking = {
      customer_name: "Rajesh Kumar",
      booking_id: "BK-TEST-12345",
      pickup_location: "Koramangala, Bangalore",
      dropoff_location: "Kempegowda International Airport",
      pickup_date: "Monday, 26 May 2026",
      pickup_time: "08:30 AM",
      vehicle_type: "Toyota Innova Crysta",
      total_amount: "₹2,500"
    };

    // Use the booking_confirmation template
    const payload = {
      messaging_product: "whatsapp",
      to: formattedPhone,
      type: "template",
      template: {
        name: "booking_confirmation",
        language: {
          code: "en_US"
        },
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: testBooking.customer_name },
              { type: "text", text: testBooking.booking_id },
              { type: "text", text: testBooking.pickup_location },
              { type: "text", text: testBooking.dropoff_location },
              { type: "text", text: testBooking.pickup_date },
              { type: "text", text: testBooking.pickup_time },
              { type: "text", text: testBooking.vehicle_type },
              { type: "text", text: testBooking.total_amount }
            ]
          }
        ]
      }
    };

    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(
      `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp API error:', result);
      
      // If template not found, provide helpful message
      if (result.error?.code === 132000 || result.error?.message?.includes('template')) {
        return NextResponse.json(
          { 
            error: "Template not found",
            message: "The 'booking_confirmation' template hasn't been created or approved yet.",
            instructions: "Please create the template in Meta Business Manager. See WHATSAPP_BOOKING_TEMPLATE_SETUP.md for instructions.",
            details: result.error?.message
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { 
          error: "Failed to send WhatsApp message",
          details: result.error?.message || 'Unknown error',
          fullError: result
        },
        { status: 500 }
      );
    }

    console.log('Booking confirmation sent successfully:', result);

    return NextResponse.json({
      success: true,
      message: "Booking confirmation template sent successfully!",
      result,
      sentTo: formattedPhone,
      testData: testBooking
    });
  } catch (error: any) {
    console.error("WhatsApp test error:", error);
    return NextResponse.json(
      { 
        error: "Failed to send WhatsApp message",
        details: error.message 
      },
      { status: 500 }
    );
  }
}
