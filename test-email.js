// Test Resend email
// Run: node test-email.js

const { Resend } = require("resend");

const resend = new Resend("re_SnY9F5Eu_BqnAmtZFWD8N9vFc3NXBqPa9");

async function test() {
  console.log("📧 Sending test email via Resend...");

  const { data, error } = await resend.emails.send({
    from: "Airlinecabz Bookings <onboarding@resend.dev>",
    to: ["shreeharshastark@gmail.com"], // Testing: only Resend account owner email allowed until domain is verified
    subject: "🚕 Test Booking Alert — Airlinecabz",
    html: `
      <div style="font-family:sans-serif;padding:32px;max-width:600px;margin:0 auto;background:#f8fafc;border-radius:16px;">
        <h2 style="color:#1e40af;">✅ Email is Working!</h2>
        <p style="color:#475569;">This is a test booking notification from your Airlinecabz app.</p>
        <div style="background:#fff;border-radius:12px;padding:24px;border:1px solid #e2e8f0;margin-top:16px;">
          <p><strong>Customer:</strong> Test User</p>
          <p><strong>Pickup:</strong> Bangalore City</p>
          <p><strong>Drop-off:</strong> Kempegowda International Airport</p>
          <p><strong>Vehicle:</strong> Innova Crysta</p>
          <p><strong>Amount:</strong> ₹1,500</p>
        </div>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px;">Airlinecabz · +91 98806 91116</p>
      </div>
    `,
  });

  if (error) {
    console.error("❌ Failed:", error);
  } else {
    console.log("✅ Email sent successfully! ID:", data.id);
    console.log("📬 Check airlinecabz@gmail.com for the test email.");
  }
}

test();
