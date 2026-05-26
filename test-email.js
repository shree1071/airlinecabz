// Test Resend email with REAL booking data format
// Run: node test-email.js

const { Resend } = require("resend");

const resend = new Resend("re_fMHdiiGt_HGSDedcVTSkz597hBvQBVjqU");

async function test() {
  console.log("📧 Sending test booking email via Resend...");

  const { data, error } = await resend.emails.send({
    from: "Airlinecabz Bookings <onboarding@resend.dev>",
    to: ["airlinecabz@gmail.com"],
    subject: "🚕 New Booking: Test User → INNOVA on " + new Date().toLocaleDateString("en-IN"),
    html: `
      <div style="font-family:sans-serif;padding:32px;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;">
        <h2 style="color:#1e40af;">🚕 New Booking Alert!</h2>
        <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;margin-top:16px;">
          <p><strong>Customer:</strong> Test User</p>
          <p><strong>Phone:</strong> +91 9901366449</p>
          <p><strong>Pickup:</strong> Rajajinagar, Bangalore</p>
          <p><strong>Drop-off:</strong> Kempegowda International Airport Terminal 1</p>
          <p><strong>Date:</strong> ${new Date().toLocaleDateString("en-IN")}</p>
          <p><strong>Vehicle:</strong> Innova Crysta</p>
          <p><strong>Base Fare:</strong> ₹1,200</p>
          <p><strong>Taxes:</strong> ₹180</p>
          <p><strong>Total Amount:</strong> ₹1,380</p>
          <p><strong>Status:</strong> Pending</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Airlinecabz · +91 98806 91116</p>
      </div>
    `,
  });

  if (error) {
    console.error("❌ Failed:", JSON.stringify(error, null, 2));
  } else {
    console.log("✅ Email sent successfully! ID:", data.id);
    console.log("📬 Check shreeharshastark@gmail.com inbox NOW (also check spam).");
  }
}

test();
