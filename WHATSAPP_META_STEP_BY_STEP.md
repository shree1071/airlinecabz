# WhatsApp Template Creation - Step-by-Step Visual Guide

## 🎯 Goal
Create the `booking_confirmation` template in Meta Business Manager

## ⏱️ Time Required
- **Creating template**: 5 minutes
- **Meta approval**: 1-24 hours (usually within a few hours)

---

## 📋 Step-by-Step Instructions

### Step 1: Open Meta Business Manager
1. Go to: **https://business.facebook.com/**
2. Log in with your Facebook account
3. Select your business account

---

### Step 2: Navigate to WhatsApp Manager
1. In the left sidebar, find **"WhatsApp Manager"**
2. Click on **"WhatsApp Manager"**
3. You should see your WhatsApp Business Account

---

### Step 3: Open Message Templates
1. In WhatsApp Manager, look for **"Message Templates"** in the left menu
2. Click on **"Message Templates"**
3. You'll see a list of existing templates (including "hello_world")
4. Click the **"Create Template"** button (usually blue, top right)

---

### Step 4: Fill in Template Details

#### 4.1 Template Name
```
Field: Template name
Enter: booking_confirmation
```
**Rules:**
- All lowercase
- No spaces (use underscore)
- Only letters, numbers, underscores

#### 4.2 Category
```
Field: Category
Select: UTILITY
```
**Important:** Choose UTILITY, NOT Marketing

#### 4.3 Languages
```
Field: Languages
Select: English (US)
```

---

### Step 5: Add Header (Optional but Recommended)

1. Click **"Add header"** or toggle header ON
2. Select type: **TEXT**
3. Enter header text:
```
Booking Confirmed
```

**Rules:**
- No variables allowed in header
- Keep it short (1-60 characters)
- No emojis

---

### Step 6: Add Body (Required)

1. In the **Body** section, paste this EXACTLY:

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

2. Meta will automatically detect the 8 variables: {{1}} through {{8}}

---

### Step 7: Add Sample Content for Variables

Meta will ask for sample values to preview the template. Enter these:

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

**Note:** These are just for preview. Real values will come from your code.

---

### Step 8: Add Footer (Optional but Recommended)

1. Click **"Add footer"** or toggle footer ON
2. Enter footer text:
```
airlinecabz.com
```

**Rules:**
- No variables allowed
- Keep it short (1-60 characters)
- Usually domain name or brand name

---

### Step 9: Add Buttons (Optional but Recommended)

#### Button 1: Call Button
1. Click **"Add button"**
2. Select type: **"Call phone number"**
3. Fill in:
   - **Button text**: `Call Us`
   - **Phone number**: `+919901366449`

#### Button 2: URL Button
1. Click **"Add button"** again
2. Select type: **"Visit website"**
3. Fill in:
   - **Button text**: `View Booking`
   - **Website URL**: `https://airlinecabz.com`

**Note:** Maximum 2 buttons for UTILITY templates

---

### Step 10: Preview Template

1. Look at the preview on the right side of the screen
2. It should look like this:

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

3. Check that:
   - ✅ All 8 variables are replaced with sample values
   - ✅ No formatting issues
   - ✅ Text is readable
   - ✅ Buttons appear correctly

---

### Step 11: Submit for Review

1. Review all fields one more time
2. Click the **"Submit"** button (usually blue, bottom right)
3. You'll see a confirmation message
4. Template status will show as **"Pending"**

---

### Step 12: Wait for Approval

**What happens next:**
1. Meta reviews your template (1-24 hours, usually faster)
2. You'll receive an **email notification** when:
   - ✅ **Approved** - Template is ready to use
   - ❌ **Rejected** - Review reason and resubmit

**While waiting:**
- Template status shows "Pending" in Meta Business Manager
- You can edit or delete the template before approval
- You cannot use the template until approved

---

### Step 13: After Approval

Once you receive the approval email:

1. ✅ Template status changes to **"Approved"**
2. ✅ Template is immediately available for use
3. ✅ Your code will automatically start using it

**Test immediately:**
1. Go to: http://localhost:3000/admin/test-booking-template
2. Enter your WhatsApp number
3. Click "Send Test Message"
4. Check your WhatsApp

---

## ✅ Final Checklist

Before submitting, verify:

- [ ] Template name: `booking_confirmation` (lowercase, underscore)
- [ ] Category: `UTILITY` (not Marketing)
- [ ] Language: `English (US)`
- [ ] Header: `Booking Confirmed`
- [ ] Body: Copied exactly from Step 6 (NO emojis, NO bullet points)
- [ ] All 8 variables: {{1}} through {{8}}
- [ ] Sample values: Entered for all variables
- [ ] Footer: `airlinecabz.com`
- [ ] Button 1: Call Us (+919901366449)
- [ ] Button 2: View Booking (https://airlinecabz.com)
- [ ] Preview: Looks correct
- [ ] No promotional language
- [ ] Professional tone

---

## 🐛 Common Issues During Creation

### Issue 1: "Template name already exists"
**Solution:** Use a different name like `booking_confirmation_v2` or delete the old template

### Issue 2: "Invalid variable format"
**Solution:** Ensure variables are {{1}}, {{2}}, etc. (not {{name}}, {{booking_id}})

### Issue 3: "Category cannot be changed"
**Solution:** Delete and recreate template with correct category

### Issue 4: "Button URL must be HTTPS"
**Solution:** Change `http://` to `https://`

### Issue 5: "Too many buttons"
**Solution:** UTILITY templates allow maximum 2 buttons

---

## 📧 Approval Email

You'll receive an email like this:

**Subject:** "Your WhatsApp message template has been approved"

**Content:**
```
Your message template "booking_confirmation" has been approved 
and is now available to use.

Template name: booking_confirmation
Language: English (US)
Status: Approved
```

---

## 🎉 After Approval - Next Steps

1. **Test the template:**
   - Visit: http://localhost:3000/admin/test-booking-template
   - Send test message to your number

2. **Test real booking:**
   - Go to: http://localhost:3000/book
   - Complete a booking with your WhatsApp number
   - Verify message received

3. **Monitor for issues:**
   - Check logs for any errors
   - Test with different phone numbers
   - Verify message formatting on mobile

4. **Go live:**
   - Your system is now automatically sending WhatsApp confirmations!
   - Every booking will trigger a WhatsApp message

---

## 📞 Need Help?

### Meta Support
- **Help Center**: https://business.facebook.com/help
- **WhatsApp Support**: https://developers.facebook.com/docs/whatsapp
- **Live Chat**: Available in Meta Business Manager (bottom right)

### Template Guidelines
- **Official Guidelines**: https://developers.facebook.com/docs/whatsapp/message-templates/guidelines
- **Business Policy**: https://www.whatsapp.com/legal/business-policy
- **Best Practices**: https://developers.facebook.com/docs/whatsapp/message-templates/best-practices

---

## 🔄 If Template Gets Rejected

### Common Rejection Reasons

1. **"Contains promotional content"**
   - Remove any marketing language
   - Keep it purely transactional
   - No "Best prices!", "Limited offer!", etc.

2. **"Violates formatting guidelines"**
   - Remove emojis from body
   - Remove bullet points
   - Use plain text only

3. **"Unclear variable usage"**
   - Ensure each variable has clear context
   - Example: "Booking ID: {{2}}" not just "{{2}}"

4. **"Wrong category"**
   - Change from Marketing to UTILITY
   - UTILITY = transactional only

### How to Resubmit

1. Go to Message Templates
2. Find the rejected template
3. Click "Edit"
4. Fix the issues mentioned in rejection reason
5. Submit again

---

## 📊 Template Management

### View Template Status
1. Go to WhatsApp Manager → Message Templates
2. Find `booking_confirmation`
3. Status will show:
   - 🟡 **Pending** - Under review
   - 🟢 **Approved** - Ready to use
   - 🔴 **Rejected** - Needs fixes

### Edit Template
- ⚠️ You can only edit templates that are pending or rejected
- ⚠️ Approved templates cannot be edited (must create new version)

### Delete Template
1. Find template in list
2. Click three dots (⋮)
3. Select "Delete"
4. Confirm deletion

---

## 🎯 Success!

Once approved, your WhatsApp integration is complete!

**What happens automatically:**
- ✅ Every booking sends WhatsApp confirmation
- ✅ Customer receives message within seconds
- ✅ Message includes all booking details
- ✅ Customer can call or view booking via buttons
- ✅ System logs all WhatsApp activity

**No further action needed!**

---

**Last Updated**: May 24, 2026  
**Status**: Ready to create template ✅  
**Estimated Time**: 5 minutes + approval wait
