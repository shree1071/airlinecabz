# WhatsApp Setup via Twilio - Complete Guide

## Overview

Twilio provides WhatsApp Business API access as an alternative to Meta's direct integration. This can be easier to set up and offers transparent pricing.

---

## 🎁 Free Trial Credits

When you create a Twilio account, you get:

- **30-day free trial**
- **Product-specific free units** including:
  - 100 SMS messages
  - 3,000 emails  
  - 75 voice minutes
  - **WhatsApp messages** (test with Twilio sandbox)

**Note:** Trial accounts can only send to verified phone numbers. After upgrading, you can message any number.

---

## 💰 Pricing (After Trial)

### Per Message Cost:
- **Twilio Fee:** $0.005 per message (inbound or outbound)
- **Meta Fee:** Varies by country and template type

### Template Types & Meta Fees (India Example):
1. **Utility Template** (Booking confirmations, receipts)
   - $0.0034 per message (outside customer service window)
   - **FREE during 24-hour customer service window**

2. **Marketing Template** (Promotions, offers)
   - Higher cost, varies by country
   - Charged even during customer service window

3. **Free-form Messages**
   - Only allowed during 24-hour customer service window
   - No Meta fee, only Twilio's $0.005

### Customer Service Window:
- Opens when customer messages you first
- Lasts 24 hours
- During this window: utility templates and free-form messages are FREE (only pay Twilio's $0.005)

### Example Cost for Your Booking Confirmations:
- **If customer messages first:** $0.005 (only Twilio fee)
- **If you message first:** $0.0034 + $0.005 = $0.0084 per message
- **Approximate:** ₹0.70 per booking confirmation

---

## 🚀 Setup Steps

### Step 1: Create Twilio Account

1. Go to [twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Sign up with email
3. Verify your phone number
4. Complete account setup

### Step 2: Try WhatsApp Sandbox (Testing)

1. Go to Twilio Console → **Messaging** → **Try it out** → **Send a WhatsApp message**
2. You'll get a sandbox number (e.g., +1 415 523 8886)
3. Send "join [code]" to the sandbox number from your WhatsApp
4. Now you can test sending/receiving messages

**Sandbox Limitations:**
- Only works with numbers that joined the sandbox
- Good for testing, not for production
- Messages have "sandbox" prefix

### Step 3: Request WhatsApp Business Profile (Production)

1. Go to **Messaging** → **Senders** → **WhatsApp senders**
2. Click **Request to enable WhatsApp**
3. Fill out business information:
   - Business name: **Airlinecabz**
   - Business website: **airlinecabz.com**
   - Business description
   - Business address
   - Business category: Transportation/Taxi Service

4. Submit for review (typically 1-3 business days)

### Step 4: Get Your WhatsApp Number

After approval:
1. You can use your existing business phone number
2. Or get a new Twilio number
3. Enable WhatsApp on that number

### Step 5: Create Message Templates

1. Go to **Messaging** → **Content Editor** → **Create Template**
2. Create your booking confirmation template:

```
Template Name: booking_confirmation
Category: UTILITY
Language: English

Body:
Hello {{1}},

Your booking has been confirmed.

Booking ID: {{2}}
From: {{3}}
To: {{4}}
Date: {{5}}
Time: {{6}}
Vehicle: {{7}}
Total Amount: ₹{{8}}

We will contact you 30 minutes before pickup. Have a safe journey.

Thank you for choosing Airlinecabz.
```

3. Submit for WhatsApp approval (usually approved within hours)

---

## 💻 Code Integration

### Install Twilio SDK

```bash
npm install twilio
```

### Add Environment Variables

Add to `.env.local`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### Update `src/lib/whatsapp.ts`

```typescript
import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendBookingConfirmation(booking: {
  customer_name: string;
  customer_phone: string;
  id: string;
  pickup_location: string;
  dropoff_location: string;
  pickup_date: string;
  vehicle_type: string;
  total_amount: number | string;
}) {
  try {
    // Format phone number (must include country code)
    const toNumber = `whatsapp:+91${booking.customer_phone.replace(/\D/g, '')}`;
    
    // Format date and time
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

    // Send template message
    const message = await client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: toNumber,
      body: `Hello ${booking.customer_name},\n\nYour booking has been confirmed.\n\nBooking ID: ${booking.id}\nFrom: ${booking.pickup_location}\nTo: ${booking.dropoff_location}\nDate: ${pickupDate}\nTime: ${pickupTime}\nVehicle: ${booking.vehicle_type}\nTotal Amount: ₹${booking.total_amount}\n\nWe will contact you 30 minutes before pickup. Have a safe journey.\n\nThank you for choosing Airlinecabz.`
    });

    console.log('WhatsApp message sent:', message.sid);
    return { success: true, messageId: message.sid };
    
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return { success: false, error };
  }
}
```

### Create API Endpoint

Create `src/app/api/send-whatsapp/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { sendBookingConfirmation } from '@/lib/whatsapp';

export async function POST(request: Request) {
  try {
    const booking = await request.json();
    
    const result = await sendBookingConfirmation(booking);
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        messageId: result.messageId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to send message' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in send-whatsapp API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
```

---

## 🔄 Automatic Sending After Booking

Update `src/app/api/bookings/route.ts` to automatically send WhatsApp:

```typescript
// After creating booking in database
const result = await sendBookingConfirmation(newBooking);

if (result.success) {
  console.log('WhatsApp confirmation sent');
} else {
  console.error('Failed to send WhatsApp, but booking created');
}
```

---

## 📱 Testing

### 1. Sandbox Testing (Free)
```bash
# Send test message via API
curl -X POST https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json \
  --data-urlencode "From=whatsapp:+14155238886" \
  --data-urlencode "To=whatsapp:+919876543210" \
  --data-urlencode "Body=Test message" \
  -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
```

### 2. Production Testing
After approval, test with real bookings from your website.

---

## ✅ Advantages of Twilio vs Meta Direct

| Feature | Twilio | Meta Direct |
|---------|--------|-------------|
| Setup Time | 1-3 days | 1-5 days |
| Technical Complexity | Easier (SDK provided) | More complex |
| Pricing Transparency | Very clear | Less clear |
| Support | Excellent | Limited |
| Dashboard | User-friendly | Complex |
| Testing | Sandbox available | Limited testing |
| Documentation | Excellent | Good |

---

## 🎯 Recommended Approach

**For Your Use Case (Cab Booking Confirmations):**

1. ✅ **Start with Twilio** - Easier setup, better support
2. ✅ **Use Utility Templates** - Cheapest option for confirmations
3. ✅ **Encourage customers to message first** - Opens 24-hour free window
4. ✅ **Upgrade after trial** - To message any customer

**Monthly Cost Estimate:**
- 100 bookings/month × $0.0084 = **$0.84/month (₹70/month)**
- Very affordable for automated confirmations!

---

## 📞 Support

- Twilio Support: [support.twilio.com](https://support.twilio.com)
- Documentation: [twilio.com/docs/whatsapp](https://www.twilio.com/docs/whatsapp)
- Community: [twilio.com/community](https://www.twilio.com/community)

---

## 🔗 Quick Links

- [Twilio Console](https://console.twilio.com)
- [WhatsApp Pricing Calculator](https://www.twilio.com/whatsapp/pricing)
- [Try WhatsApp Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
- [Content Editor (Templates)](https://console.twilio.com/us1/develop/sms/content-editor)

---

**Ready to implement? Let me know and I'll help you integrate the Twilio code!**
