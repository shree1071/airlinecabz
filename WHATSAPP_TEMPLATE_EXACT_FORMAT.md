# WhatsApp Template - Exact Format for Meta Business Manager

## 🎯 Copy-Paste Ready Template

Use this EXACT format when creating your template in Meta Business Manager.

---

## Template Name
```
booking_confirmation
```
**Rules:**
- ✅ All lowercase
- ✅ No spaces (use underscore)
- ✅ Only letters, numbers, and underscores

---

## Category
```
UTILITY
```
**Important:** 
- ✅ Use UTILITY (for transactional messages)
- ❌ NOT Marketing (that's for promotional content)
- ❌ NOT Authentication (that's for OTP codes)

---

## Language
```
English (US)
```
**Code:** `en_US`

---

## Header (Optional but Recommended)

**Type:** TEXT

**Content:**
```
Booking Confirmed
```

**Rules:**
- ✅ Keep it short (1-60 characters)
- ✅ No variables allowed in header
- ✅ No emojis
- ✅ Professional tone

---

## Body (Required)

**COPY THIS EXACTLY:**

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

**Variable Definitions:**
- `{{1}}` = Customer Name
- `{{2}}` = Booking ID
- `{{3}}` = Pickup Location
- `{{4}}` = Dropoff Location
- `{{5}}` = Pickup Date
- `{{6}}` = Pickup Time
- `{{7}}` = Vehicle Type
- `{{8}}` = Total Amount

**Rules:**
- ✅ Variables must be in format `{{1}}`, `{{2}}`, etc.
- ✅ Variables must be sequential (no skipping numbers)
- ✅ Maximum 1024 characters
- ✅ No emojis in UTILITY templates
- ✅ No bullet points (• or -)
- ✅ Use plain text formatting only
- ✅ Professional, transactional language
- ✅ Date and Time are separate fields for clarity
- ❌ No promotional content
- ❌ No marketing language
- ❌ No excessive punctuation (!!!)

---

## Footer (Optional but Recommended)

**Type:** TEXT

**Content:**
```
airlinecabz.com
```

**Rules:**
- ✅ Keep it short (1-60 characters)
- ✅ No variables allowed
- ✅ Usually domain name or brand name
- ✅ No promotional text

---

## Buttons (Optional but Recommended)

### Button 1: Call Button

**Type:** `PHONE_NUMBER`

**Button Text:**
```
Call Us
```

**Phone Number:**
```
+919901366449
```

**Rules:**
- ✅ Include country code with +
- ✅ No spaces or dashes
- ✅ Button text: 1-25 characters

---

### Button 2: URL Button

**Type:** `URL`

**Button Text:**
```
View Booking
```

**URL:**
```
https://airlinecabz.com
```

**Rules:**
- ✅ Must be HTTPS (not HTTP)
- ✅ Must be a valid, accessible URL
- ✅ No URL shorteners
- ✅ Button text: 1-25 characters

---

## Maximum Buttons

**UTILITY Templates:** Maximum 2 buttons
- 1 Call button + 1 URL button, OR
- 2 URL buttons, OR
- 1 Quick Reply button

---

## Complete Template Summary

```
┌─────────────────────────────────────────┐
│ Template Name: booking_confirmation     │
│ Category: UTILITY                       │
│ Language: English (US)                  │
├─────────────────────────────────────────┤
│ HEADER (TEXT)                           │
│ Booking Confirmed                       │
├─────────────────────────────────────────┤
│ BODY                                    │
│ Hello {{1}},                            │
│                                         │
│ Your booking has been confirmed.        │
│                                         │
│ Booking ID: {{2}}                       │
│ From: {{3}}                             │
│ To: {{4}}                               │
│ Date: {{5}}                             │
│ Time: {{6}}                             │
│ Vehicle: {{7}}                          │
│ Total Amount: {{8}}                     │
│                                         │
│ We will contact you 30 minutes before   │
│ pickup. Have a safe journey.            │
│                                         │
│ Thank you for choosing Airlinecabz.     │
├─────────────────────────────────────────┤
│ FOOTER                                  │
│ airlinecabz.com                         │
├─────────────────────────────────────────┤
│ BUTTONS                                 │
│ [Call Us: +919901366449]                │
│ [View Booking: https://airlinecabz.com] │
└─────────────────────────────────────────┘
```

---

## Sample Values for Testing

When Meta asks for sample values during template creation:

| Variable | Sample Value |
|----------|--------------|
| {{1}} | Rajesh Kumar |
| {{2}} | BK-ABC123 |
| {{3}} | Koramangala, Bangalore |
| {{4}} | Kempegowda International Airport |
| {{5}} | Monday, 26 May 2026 |
| {{6}} | 08:30 AM |
| {{7}} | Toyota Innova Crysta |
| {{8}} | ₹2,500 |

---

## Preview of Final Message

```
┌─────────────────────────────────────────┐
│ Booking Confirmed                       │
├─────────────────────────────────────────┤
│ Hello Rajesh Kumar,                     │
│                                         │
│ Your booking has been confirmed.        │
│                                         │
│ Booking ID: BK-ABC123                   │
│ From: Koramangala, Bangalore            │
│ To: Kempegowda International Airport    │
│ Date: Monday, 26 May 2026               │
│ Time: 08:30 AM                          │
│ Vehicle: Toyota Innova Crysta           │
│ Total Amount: ₹2,500                    │
│                                         │
│ We will contact you 30 minutes before   │
│ pickup. Have a safe journey.            │
│                                         │
│ Thank you for choosing Airlinecabz.     │
├─────────────────────────────────────────┤
│ airlinecabz.com                         │
├─────────────────────────────────────────┤
│ [Call Us] [View Booking]                │
└─────────────────────────────────────────┘
```

---

## Common Mistakes to Avoid

| ❌ Wrong | ✅ Correct |
|---------|-----------|
| `booking-confirmation` | `booking_confirmation` |
| Category: Marketing | Category: UTILITY |
| `Hello {{name}},` | `Hello {{1}},` |
| `• Booking ID: {{2}}` | `Booking ID: {{2}}` |
| `🚗 Vehicle: {{6}}` | `Vehicle: {{6}}` |
| `http://airlinecabz.com` | `https://airlinecabz.com` |
| `We'll contact you...` | `We will contact you...` |
| `- Airlinecabz Team` | `Thank you for choosing Airlinecabz.` |

---

## Approval Checklist

Before submitting, verify:

- [ ] Template name is `booking_confirmation` (lowercase, underscore)
- [ ] Category is `UTILITY` (not Marketing)
- [ ] Language is `English (US)`
- [ ] Body has NO emojis
- [ ] Body has NO bullet points (• or -)
- [ ] All variables are sequential: {{1}}, {{2}}, {{3}}, {{4}}, {{5}}, {{6}}, {{7}}
- [ ] No promotional language (e.g., "Best prices!", "Limited offer!")
- [ ] Professional, transactional tone
- [ ] Footer is simple (just domain name)
- [ ] Buttons use HTTPS URLs
- [ ] Phone number includes country code (+91)
- [ ] Sample values provided for all variables

---

## Submission Steps

1. **Log in** to Meta Business Manager
2. **Navigate** to WhatsApp Manager
3. **Click** "Message Templates"
4. **Click** "Create Template"
5. **Fill in** all fields using the format above
6. **Add sample values** for each variable
7. **Preview** the template
8. **Submit** for review
9. **Wait** for email notification (1-24 hours)
10. **Test** using `/admin/test-booking-template` once approved

---

## After Approval

Once you receive approval email:

1. ✅ Template is immediately available for use
2. ✅ Your code will automatically use it
3. ✅ Test with: http://localhost:3000/admin/test-booking-template
4. ✅ Real bookings will send WhatsApp notifications automatically

---

## Need Help?

- **Template Guidelines**: https://developers.facebook.com/docs/whatsapp/message-templates/guidelines
- **WhatsApp Business Policy**: https://www.whatsapp.com/legal/business-policy
- **Meta Business Support**: https://business.facebook.com/help

---

**Last Updated**: May 24, 2026  
**Compliance**: WhatsApp Business Policy v2026  
**Status**: Ready to submit ✅
