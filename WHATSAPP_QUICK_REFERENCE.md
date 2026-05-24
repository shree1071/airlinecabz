# WhatsApp Integration - Quick Reference

## 🚀 Current Status
✅ **Working**: WhatsApp API connected and tested  
⏳ **Pending**: Create `booking_confirmation` template in Meta Business Manager

## 📋 What You Need to Do

### Step 1: Create Template (5 minutes)
1. Go to: https://business.facebook.com/
2. Navigate: **WhatsApp Manager** → **Message Templates** → **Create Template**
3. Fill in:
   - **Name**: `booking_confirmation`
   - **Category**: `UTILITY`
   - **Language**: `English (US)`
   - **Header**: `Booking Confirmed`
   - **Body**: (Copy from below - NO emojis, NO bullet points)
   
```
Hello {{1}},

Your booking has been confirmed.

Booking ID: {{2}}
From: {{3}}
To: {{4}}
Date: {{5}}
Time: {{6}}
Vehicle: {{7}}
Total Amount: {{8}}

We will contact you 30 minutes before pickup. Have a safe journey.

Thank you for choosing Airlinecabz.
```

   - **Footer**: `airlinecabz.com`
   - **Buttons**: 
     - Call Us: +919901366449
     - View Booking: https://airlinecabz.com

4. Submit and wait for approval (1-24 hours)

**IMPORTANT**: 
- ✅ Use UTILITY category (not MARKETING)
- ✅ No emojis in body text
- ✅ No bullet points or special characters
- ✅ Professional, transactional language only
- ✅ All 8 variables must be used (Date and Time are separate)

### Step 2: Test (2 minutes)
Once approved:
1. Visit: http://localhost:3000/admin/test-booking-template
2. Enter your WhatsApp number
3. Click "Send Test Message"
4. Check your WhatsApp

### Step 3: Verify (1 minute)
Test real booking:
1. Go to: http://localhost:3000/book
2. Fill booking form with your number
3. Submit
4. Check WhatsApp for confirmation

## 🎯 What Happens Automatically

When a customer books:
```
Customer submits booking
         ↓
Booking saved to database
         ↓
WhatsApp message sent automatically ✅
         ↓
Customer receives confirmation on WhatsApp
```

## 📱 Test Pages

| Page | URL | Purpose |
|------|-----|---------|
| **Booking Template Test** | `/admin/test-booking-template` | Test booking confirmation with sample data |
| **Hello World Test** | `/admin/whatsapp-hello` | Test basic WhatsApp connectivity |
| **Dashboard** | `/admin/dashboard` | Has WhatsApp link in header |

## 📄 Documentation Files

| File | Purpose |
|------|---------|
| `WHATSAPP_BOOKING_TEMPLATE_SETUP.md` | Complete setup instructions |
| `WHATSAPP_INTEGRATION_STATUS.md` | Detailed status and testing guide |
| `WHATSAPP_QUICK_REFERENCE.md` | This file - quick overview |

## 🔧 Configuration

Everything is already configured in `.env.local`:
```env
WHATSAPP_ACCESS_TOKEN=EAAN9kWbFySgBRobg9CD2MXULmMZBLcfYUXYEFJQnpcNvKuTN9UVwZC4eMdwEbkh14yUPQFelg5AbuDbidWwKMVZCZAjhVIdw84KCwhZAeCpRRxaIy1crUThflxnEp2EG5heoiwSev07ZBRXotknIj6qVR7bzZB3zQArFVZBa4hryHRQibMxbNClQuu38p4910R5wRTTmYKQ2NSj7iZBUa8ZCcXcbKjysZCmLsjKTSOZA5ZA3NRpzRhiZBcubJtSw2pCGu5Xtfom8oGSHjMvuUieSLt8Y5N
WHATSAPP_PHONE_NUMBER_ID=1169752749545559
```

## 💬 Message Preview

Customers will receive:
```
Booking Confirmed

Hello Rajesh Kumar,

Your booking has been confirmed.

Booking ID: BK-ABC123
From: Koramangala, Bangalore
To: Kempegowda International Airport
Date: Monday, 26 May 2026
Time: 08:30 AM
Vehicle: Toyota Innova Crysta
Total Amount: ₹2,500

We will contact you 30 minutes before pickup. Have a safe journey.

Thank you for choosing Airlinecabz.

airlinecabz.com

[Call Us] [View Booking]
```

## ⚡ Quick Commands

### Test Hello World (works now)
```bash
curl -X POST http://localhost:3000/api/test-hello-world \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"919901366449"}'
```

### Test Booking Template (after approval)
```bash
curl -X POST http://localhost:3000/api/test-booking-template \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"919901366449"}'
```

## 🐛 Common Issues

| Error | Solution |
|-------|----------|
| Template not found | Create template in Meta Business Manager |
| Account not registered | Check phone number format (919901366449) |
| Access token expired | Generate new token (expires after 90 days) |

## ✅ Checklist

- [x] WhatsApp API configured
- [x] Code implemented
- [x] Test endpoints created
- [x] Documentation written
- [ ] **Template created in Meta** ← YOU ARE HERE
- [ ] Template approved
- [ ] End-to-end test passed
- [ ] Production ready

## 🎉 Next Action

**Create the template now**: https://business.facebook.com/

Takes 5 minutes to create, 1-24 hours for approval.
