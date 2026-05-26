// Test script for WhatsApp Admin Alert
// Run with: node test-whatsapp.js

const token = "EAAN9kWbFySgBRqxYJeNhzf45EZCZBFJkW58uYWR6mw4JioJTtEKLZCnyn0xq0qXlTxfJgUIoyFrIJJaWRh9p3UTZBedVc4tPTQGqMVqRF6ZBo2ZCqesB7ImHZCpYHC8cA0dgaS4ULpY1AVcYFTtVx6CVdbORQGS656CFyVDZColZBh1Ellp2NTBAe7pDYOXdcPZA8e0gfJDFUtgB3ZABHPlJFGhyRZAe1VRZCTMZBA1B0MQUM0NoSZASkPT4bkN0DyLv0EbTaFluPzOEKHRd86rwZAkHyymyQzMZD";
const phoneId = "1169752749545559";
const adminPhone = "919901366449"; // +91 9901366449

// Test booking data
const booking = {
  id: "TEST-" + Date.now().toString().slice(-6),
  pickup_location: "123S, MNETF, BMS, REGE, PIN: 456435",
  dropoff_location: "Kempegowda International Airport, Bangalore",
  pickup_date: new Date().toISOString(),
  vehicle_type: "INNOVA",
  total_amount: "1000"
};

const dt = new Date(booking.pickup_date);
const dateStr = dt.toLocaleDateString("en-IN", { day: "numeric", month: "numeric", year: "numeric" });
const timeStr = dt.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });

const payload = {
  messaging_product: "whatsapp",
  to: adminPhone,
  type: "template",
  template: {
    name: "booking_confirm",
    language: { code: "en" },
    components: [
      {
        type: "body",
        parameters: [
          { type: "text", text: "SHREEHARSHA" },
          { type: "text", text: booking.id },
          { type: "text", text: booking.pickup_location.slice(0, 40) },
          { type: "text", text: booking.dropoff_location.slice(0, 40) },
          { type: "text", text: dateStr },
          { type: "text", text: timeStr },
          { type: "text", text: booking.vehicle_type },
          { type: "text", text: booking.total_amount.toString() }
        ]
      }
    ]
  }
};

console.log("🚀 Sending WhatsApp test alert...");
console.log("📱 To:", "+" + adminPhone);
console.log("📋 Template: booking_confirmed");
console.log("📦 Booking ID:", booking.id);
console.log("");

fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(res => res.json())
.then(data => {
  if (data.messages) {
    console.log("✅ SUCCESS! WhatsApp alert sent!");
    console.log("   Message ID:", data.messages[0].id);
    console.log("   Check your WhatsApp (+91 9880691116) now!");
  } else {
    console.log("❌ FAILED! Error from Meta API:");
    console.log(JSON.stringify(data, null, 2));
    if (data.error?.code === 132000) {
      console.log("\n💡 TIP: Template name mismatch. Check the exact template name in Meta WhatsApp Manager.");
    } else if (data.error?.code === 190) {
      console.log("\n💡 TIP: Access token expired. Get a new one from Meta Developer portal.");
    }
  }
})
.catch(err => {
  console.error("❌ Network error:", err.message);
});
