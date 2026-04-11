import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { email, customer_name, booking_id, pickup_date, amount } = body;

    if (process.env.RESEND_API_KEY === "re_REPLACE_ME") {
      console.log("Simulating email send for:", email);
      return NextResponse.json({ success: true, simulated: true });
    }

    const { data, error } = await resend.emails.send({
      from: "AirlinCabz <bookings@airlincabz.com>",
      to: [email],
      subject: "Booking Confirmation - AirlinCabz",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1b22">
          <h2 style="color: #00288e;">Your Ride is Confirmed!</h2>
          <p>Hi ${customer_name},</p>
          <p>Thank you for choosing AirlinCabz. We have received your booking and your deposit payment of ₹${amount}.</p>
          
          <div style="background-color: #f4f2fc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p><strong>Booking Reference:</strong> ${booking_id}</p>
            <p><strong>Pickup Date & Time:</strong> ${new Date(pickup_date).toLocaleString()}</p>
          </div>
          
          <p>Our chauffeur details will be shared with you 2 hours prior to the pickup time.</p>
          
          <p>For any assistance, please reply to this email or contact our 24/7 concierge support.</p>
          <br />
          <p>Best regards,</p>
          <p><strong>AirlinCabz Team</strong></p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Email API failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
