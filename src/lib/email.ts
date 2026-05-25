import nodemailer from "nodemailer";

interface BookingEmailData {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  vehicle_type: string;
  trip_type: string;
  terminal?: string;
  base_fare: number;
  taxes: number;
  total_amount: number;
  area?: string;
  landmark?: string;
  status: string;
  created_at?: string;
}

function formatCurrency(amount: number) {
  return `₹${Number(amount).toLocaleString("en-IN")}`;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    });
  } catch {
    return dateStr;
  }
}

function getTripTypeLabel(tripType: string) {
  if (tripType === "to_airport") return "🛫 To Airport";
  if (tripType === "from_airport") return "🛬 From Airport";
  if (tripType === "outstation") return "🗺️ Outstation";
  if (tripType === "local") return "🚕 Local";
  return tripType;
}

function getVehicleEmoji(vehicleType: string) {
  const v = vehicleType.toLowerCase();
  if (v.includes("innova crysta")) return "🚙";
  if (v.includes("innova")) return "🚙";
  if (v.includes("swift") || v.includes("dzire")) return "🚗";
  if (v.includes("etios") || v.includes("toyota")) return "🚖";
  if (v.includes("hatchback")) return "🚗";
  return "🚕";
}

export function buildBookingEmailHTML(booking: BookingEmailData): string {
  const vehicle = booking.vehicle_type || "N/A";
  const tripLabel = getTripTypeLabel(booking.trip_type);
  const vehicleEmoji = getVehicleEmoji(vehicle);
  const terminal =
    booking.terminal === "terminal1"
      ? "Terminal 1"
      : booking.terminal === "terminal2"
      ? "Terminal 2"
      : null;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Booking – Airlinecabz</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f0f4ff; color: #1e293b; }
  </style>
</head>
<body style="background:#f0f4ff; padding: 32px 16px; font-family:'Inter',sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:640px; margin:0 auto;">
    
    <!-- Header -->
    <tr>
      <td>
        <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 50%, #2563eb 100%); border-radius: 20px 20px 0 0; padding: 36px 40px;">
          <tr>
            <td>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:rgba(255,255,255,0.15); border-radius:14px; padding: 12px 16px; display:inline-block;">
                    <span style="font-size:28px;">✈️</span>
                  </td>
                  <td style="padding-left:16px;">
                    <div style="color:#bfdbfe; font-size:12px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase;">AIRLINECABZ</div>
                    <div style="color:#ffffff; font-size:22px; font-weight:800; margin-top:2px;">New Booking Alert!</div>
                  </td>
                </tr>
              </table>
              <div style="margin-top:20px; background:rgba(255,255,255,0.12); border-radius:12px; padding:16px 20px; display:inline-block;">
                <span style="color:#93c5fd; font-size:12px; font-weight:500;">BOOKING ID</span>
                <div style="color:#ffffff; font-size:16px; font-weight:700; font-family:monospace; margin-top:4px;">#${booking.id?.slice(0, 8).toUpperCase() || "NEW"}</div>
              </div>
              <div style="float:right; margin-top:20px; background:rgba(255,255,255,0.12); border-radius:12px; padding:16px 20px; display:inline-block;">
                <span style="color:#93c5fd; font-size:12px; font-weight:500;">STATUS</span>
                <div style="color:#fbbf24; font-size:14px; font-weight:700; margin-top:4px;">⏳ PENDING REVIEW</div>
              </div>
              <div style="clear:both;"></div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    <!-- Body -->
    <tr>
      <td style="background:#ffffff; padding: 0 40px 40px 40px;">

        <!-- Action Banner -->
        <div style="background:#fffbeb; border: 1px solid #fde68a; border-radius:12px; padding:16px 20px; margin:28px 0; display:flex; align-items:center;">
          <span style="font-size:24px; margin-right:12px;">🔔</span>
          <div>
            <div style="font-size:13px; font-weight:700; color:#92400e;">ACTION REQUIRED</div>
            <div style="font-size:13px; color:#78350f; margin-top:2px;">Please review and confirm this booking in your admin panel.</div>
          </div>
        </div>

        <!-- Customer Info -->
        <div style="margin-bottom:24px;">
          <div style="font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:1px; text-transform:uppercase; margin-bottom:14px;">👤 Customer Details</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:18px 20px; border-bottom:1px solid #e2e8f0;">
                <div style="font-size:12px; color:#94a3b8; font-weight:500;">Full Name</div>
                <div style="font-size:16px; font-weight:700; color:#0f172a; margin-top:4px;">${booking.customer_name}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px; border-bottom:1px solid #e2e8f0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%">
                      <div style="font-size:12px; color:#94a3b8; font-weight:500;">📱 Phone</div>
                      <div style="font-size:14px; font-weight:600; color:#1e293b; margin-top:4px;">${booking.customer_phone}</div>
                    </td>
                    <td width="50%">
                      <div style="font-size:12px; color:#94a3b8; font-weight:500;">✉️ Email</div>
                      <div style="font-size:14px; font-weight:600; color:#1e293b; margin-top:4px;">${booking.customer_email}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <!-- Trip Info -->
        <div style="margin-bottom:24px;">
          <div style="font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:1px; text-transform:uppercase; margin-bottom:14px;">${vehicleEmoji} Trip Details</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:18px 20px; border-bottom:1px solid #e2e8f0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td width="50%">
                      <div style="font-size:12px; color:#94a3b8; font-weight:500;">Trip Type</div>
                      <div style="font-size:14px; font-weight:700; color:#1d4ed8; margin-top:4px;">${tripLabel}</div>
                    </td>
                    <td width="50%">
                      <div style="font-size:12px; color:#94a3b8; font-weight:500;">Vehicle</div>
                      <div style="font-size:14px; font-weight:700; color:#1e293b; margin-top:4px;">${vehicleEmoji} ${vehicle}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px; border-bottom:1px solid #e2e8f0;">
                <div style="font-size:12px; color:#94a3b8; font-weight:500;">📅 Pickup Date & Time</div>
                <div style="font-size:15px; font-weight:700; color:#0f172a; margin-top:6px;">${formatDate(booking.pickup_date)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px; border-bottom:1px solid #e2e8f0;">
                <div style="font-size:12px; color:#94a3b8; font-weight:500;">📍 Pickup From</div>
                <div style="font-size:14px; font-weight:600; color:#1e293b; margin-top:4px;">${booking.pickup_location}</div>
                ${booking.area ? `<div style="font-size:12px; color:#64748b; margin-top:2px;">Area: ${booking.area}</div>` : ""}
                ${booking.landmark ? `<div style="font-size:12px; color:#64748b; margin-top:2px;">Landmark: ${booking.landmark}</div>` : ""}
              </td>
            </tr>
            <tr>
              <td style="padding:18px 20px; border-bottom:${terminal ? "1px solid #e2e8f0" : "none"};">
                <div style="font-size:12px; color:#94a3b8; font-weight:500;">🏁 Drop To</div>
                <div style="font-size:14px; font-weight:600; color:#1e293b; margin-top:4px;">${booking.dropoff_location}</div>
              </td>
            </tr>
            ${
              terminal
                ? `<tr>
              <td style="padding:18px 20px;">
                <div style="font-size:12px; color:#94a3b8; font-weight:500;">🛫 Terminal</div>
                <div style="font-size:14px; font-weight:700; color:#1d4ed8; margin-top:4px;">${terminal}</div>
              </td>
            </tr>`
                : ""
            }
          </table>
        </div>

        <!-- Fare Breakdown -->
        <div style="margin-bottom:28px;">
          <div style="font-size:11px; font-weight:700; color:#94a3b8; letter-spacing:1px; text-transform:uppercase; margin-bottom:14px;">💰 Fare Breakdown</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border-radius:14px; overflow:hidden; border:1px solid #e2e8f0;">
            <tr>
              <td style="padding:16px 20px; border-bottom:1px solid #e2e8f0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px; color:#475569;">Base Fare</td>
                    <td style="font-size:14px; color:#1e293b; font-weight:600; text-align:right;">${formatCurrency(booking.base_fare || 0)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 20px; border-bottom:1px solid #e2e8f0;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:14px; color:#475569;">Taxes & Fees</td>
                    <td style="font-size:14px; color:#1e293b; font-weight:600; text-align:right;">${formatCurrency(booking.taxes || 0)}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:20px 20px; background:linear-gradient(135deg,#1e40af,#2563eb); border-radius:0 0 14px 14px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size:15px; color:#bfdbfe; font-weight:600;">Total Amount</td>
                    <td style="font-size:24px; color:#ffffff; font-weight:800; text-align:right;">${formatCurrency(booking.total_amount || 0)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </div>

        <!-- CTA -->
        <div style="text-align:center; margin-bottom:28px;">
          <a href="https://airlinecabz.com/admin/dashboard" style="display:inline-block; background:linear-gradient(135deg,#1e40af,#2563eb); color:#ffffff; text-decoration:none; padding:16px 40px; border-radius:12px; font-size:15px; font-weight:700; letter-spacing:0.3px;">
            Open Admin Dashboard →
          </a>
          <div style="margin-top:12px;">
            <a href="https://wa.me/${booking.customer_phone?.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${booking.customer_name}, your Airlinecabz booking is confirmed!`)}" style="display:inline-block; background:#dcfce7; color:#166534; text-decoration:none; padding:10px 28px; border-radius:10px; font-size:13px; font-weight:600; margin-top:8px;">
              💬 WhatsApp Customer
            </a>
          </div>
        </div>

      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:#f8fafc; border-radius:0 0 20px 20px; border-top:1px solid #e2e8f0; padding:24px 40px; text-align:center;">
        <div style="font-size:12px; color:#94a3b8; line-height:1.8;">
          <strong style="color:#475569;">Airlinecabz</strong> · Bangalore Airport Taxi Service<br/>
          📞 +91 98806 91116 · ✉️ airlinecabz@gmail.com<br/>
          <span style="font-size:11px;">This is an automated notification. Do not reply to this email.</span>
        </div>
      </td>
    </tr>

  </table>
</body>
</html>`;
}

export async function sendBookingNotificationEmail(
  booking: BookingEmailData
): Promise<void> {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    console.warn(
      "[Email] GMAIL_USER or GMAIL_APP_PASSWORD not set — skipping email notification."
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  const html = buildBookingEmailHTML(booking);

  await transporter.sendMail({
    from: `"Airlinecabz Bookings" <${gmailUser}>`,
    to: "airlinecabz@gmail.com",
    subject: `🚕 New Booking: ${booking.customer_name} → ${booking.vehicle_type} on ${new Date(booking.pickup_date).toLocaleDateString("en-IN")}`,
    html,
  });

  console.log(
    `[Email] Booking notification sent to airlinecabz@gmail.com for booking ${booking.id}`
  );
}
