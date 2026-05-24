# WhatsApp Integration - Complete Guide

## 📚 Documentation Files

| File | Purpose | When to Use |
|------|---------|-------------|
| **WHATSAPP_TEMPLATE_EXACT_FORMAT.md** | ⭐ **START HERE** - Exact copy-paste format for Meta | Creating template in Meta Business Manager |
| **WHATSAPP_QUICK_REFERENCE.md** | Quick overview and testing | Quick lookup and testing |
| **WHATSAPP_BOOKING_TEMPLATE_SETUP.md** | Detailed setup guide | Complete instructions and troubleshooting |
| **WHATSAPP_INTEGRATION_STATUS.md** | Technical implementation details | Understanding the code |

---

## 🚀 Quick Start (3 Steps)

### Step 1: Create Template (5 minutes)
1. Open: https://business.facebook.com/
2. Go to: **WhatsApp Manager** → **Message Templates** → **Create Template**
3. Copy EXACT format from: `WHATSAPP_TEMPLATE_EXACT_FORMAT.md`
4. Submit and wait for approval (1-24 hours)

### Step 2: Test Template (2 minutes)
Once approved:
1. Visit: http://localhost:3000/admin/test-booking-template
2. Enter your WhatsApp number
3. Click "Send Test Message"
4. Check WhatsApp

### Step 3: Verify Real Booking (1 minute)
1. Go to: http://localhost:3000/book
2. Fill form with your WhatsApp number
3. Submit booking
4. Check WhatsApp for confirmation

---

## ✅ What's Already Done

- ✅ WhatsApp API integrated and working
- ✅ Code ready to send booking confirmations
- ✅ Automatic notification on every booking
- ✅ Fallback to plain text if template fails
- ✅ Error handling and logging
- ✅ Test pages created
- ✅ Phone number formatting (handles all formats)
- ✅ Non-blocking (booking succeeds even if WhatsApp fails)

---

## ⏳ What You Need to Do

**Only 1 thing:** Create the template in Meta Business Manager

**Time required:** 5 minutes to create + 1-24 hours for approval

**Instructions:** See `WHATSAPP_TEMPLATE_EXACT_FORMAT.md`

---

## 📱 Template Format (Meta-Compliant)

**IMPORTANT RULES:**
- ✅ Category: UTILITY (not Marketing)
- ✅ NO emojis in body text
- ✅ NO bullet points (• or -)
- ✅ Professional, transactional language only
- ✅ Variables: {{1}} through {{7}}

**Template Name:** `booking_confirmation`

**Body:**
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

**Full format:** See `WHATSAPP_TEMPLATE_EXACT_FORMAT.md`

---

## 🧪 Testing

### Test Pages Available

| Page | URL | Status |
|------|-----|--------|
| **Hello World** | `/admin/whatsapp-hello` | ✅ Working now |
| **Booking Template** | `/admin/test-booking-template` | ⏳ After approval |
| **Dashboard** | `/admin/dashboard` | ✅ Has WhatsApp link |

### Test Commands

```bash
# Test hello_world (works now)
curl -X POST http://localhost:3000/api/test-hello-world \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"919901366449"}'

# Test booking_confirmation (after approval)
curl -X POST http://localhost:3000/api/test-booking-template \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"919901366449"}'
```

---

## 🔧 Configuration

Everything is configured in `.env.local`:

```env
WHATSAPP_ACCESS_TOKEN=EAAN9kWbFySgBRobg9CD2MXULmMZBLcfYUXYEFJQnpcNvKuTN9UVwZC4eMdwEbkh14yUPQFelg5AbuDbidWwKMVZCZAjhVIdw84KCwhZAeCpRRxaIy1crUThflxnEp2EG5heoiwSev07ZBRXotknIj6qVR7bzZB3zQArFVZBa4hryHRQibMxbNClQuu38p4910R5wRTTmYKQ2NSj7iZBUa8ZCcXcbKjysZCmLsjKTSOZA5ZA3NRpzRhiZBcubJtSw2pCGu5Xtfom8oGSHjMvuUieSLt8Y5N
WHATSAPP_PHONE_NUMBER_ID=1169752749545559
```

**Note:** Access token expires after 90 days

---

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

---

## 🔄 How It Works

```
Customer submits booking
         ↓
POST /api/bookings
         ↓
Booking saved to database
         ↓
sendWhatsAppNotification() called automatically
         ↓
    ┌────┴────┐
    ↓         ↓
Template    Template
 Found      Not Found
    ↓         ↓
Send with   Send plain
parameters  text message
    ↓         ↓
    └────┬────┘
         ↓
Customer receives WhatsApp message
         ↓
Booking succeeds (even if WhatsApp fails)
```

---

## 🐛 Troubleshooting

| Error | Cause | Solution |
|-------|-------|----------|
| Template not found (132000) | Template not created/approved | Create template in Meta |
| Account not registered (133010) | Wrong phone format or not on WhatsApp | Use format: 919901366449 |
| Access token expired (190) | Token older than 90 days | Generate new token |
| Rate limit (80007) | Too many messages | Wait and retry |

**Detailed troubleshooting:** See `WHATSAPP_BOOKING_TEMPLATE_SETUP.md`

---

## 📊 Code Files

| File | Purpose |
|------|---------|
| `src/lib/whatsapp.ts` | Main WhatsApp integration |
| `src/app/api/bookings/route.ts` | Calls WhatsApp on booking |
| `src/app/api/test-booking-template/route.ts` | Test endpoint |
| `src/app/admin/test-booking-template/page.tsx` | Test UI |

---

## 📈 Production Checklist

- [ ] Template created in Meta Business Manager
- [ ] Template approved (check email)
- [ ] Tested with `/admin/test-booking-template`
- [ ] Tested real booking flow
- [ ] Verified message on mobile device
- [ ] Tested with multiple phone numbers
- [ ] Monitored logs for errors
- [ ] Documented access token expiry date

---

## 🎯 Success Criteria

- [x] WhatsApp API working ✅
- [x] Code implemented ✅
- [x] Test endpoints created ✅
- [x] Documentation complete ✅
- [ ] **Template created** ← YOU ARE HERE
- [ ] Template approved
- [ ] End-to-end test passed
- [ ] Production ready

---

## 📞 Support Resources

- **Meta Business Manager**: https://business.facebook.com/
- **WhatsApp API Docs**: https://developers.facebook.com/docs/whatsapp
- **Template Guidelines**: https://developers.facebook.com/docs/whatsapp/message-templates/guidelines
- **Business Policy**: https://www.whatsapp.com/legal/business-policy

---

## 🎉 Next Action

**Create the template now:**

1. Open: https://business.facebook.com/
2. Follow: `WHATSAPP_TEMPLATE_EXACT_FORMAT.md`
3. Submit and wait for approval
4. Test when approved

**Time:** 5 minutes to create + 1-24 hours for approval

---

## 📝 Quick Reference

| What | Where |
|------|-------|
| **Create template** | https://business.facebook.com/ |
| **Exact format** | `WHATSAPP_TEMPLATE_EXACT_FORMAT.md` |
| **Test page** | http://localhost:3000/admin/test-booking-template |
| **Dashboard** | http://localhost:3000/admin/dashboard |
| **Troubleshooting** | `WHATSAPP_BOOKING_TEMPLATE_SETUP.md` |

---

**Status**: Ready for template creation ✅  
**Last Updated**: May 24, 2026  
**API Version**: v25.0
