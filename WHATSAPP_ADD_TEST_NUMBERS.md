# Add Test Numbers to WhatsApp (Quick Fix)

## 🎯 Goal
Add specific phone numbers you can message RIGHT NOW (before production mode)

---

## ⚡ Quick Steps (5 minutes)

### Step 1: Open WhatsApp Manager
1. Go to: https://business.facebook.com/
2. Navigate to: **WhatsApp Manager**
3. Click on: **Account Tools** → **Phone Numbers**

### Step 2: Select Your Phone Number
1. Find your phone number: **+1 555 639 3449** (or your actual number)
2. Click on it to open details

### Step 3: Add Test Recipients
1. Scroll down to: **"Test Recipients"** section
2. Click: **"Add Recipient"** or **"Manage"**
3. Enter phone number with country code (e.g., `919901366449`)
4. Click: **"Add"** or **"Send Invitation"**

### Step 4: Recipient Accepts (if required)
- Some numbers may need to accept invitation
- They'll receive a WhatsApp message
- They click "Accept" in the message
- Once accepted, you can message them

---

## 📱 Phone Number Format

**Correct Format:**
```
919901366449
```

**Rules:**
- ✅ Include country code (91 for India)
- ✅ No spaces
- ✅ No dashes
- ✅ No plus sign (+)
- ✅ Just digits

**Examples:**

| Country | Format | Example |
|---------|--------|---------|
| India | 91XXXXXXXXXX | 919901366449 |
| USA | 1XXXXXXXXXX | 15551234567 |
| UK | 44XXXXXXXXXX | 447911123456 |

---

## 🔢 Limitations

**Maximum Test Numbers:**
- **5 numbers** maximum in development mode
- Can remove and add different numbers
- No limit on how many times you change them

**Who Can Be Added:**
- Any valid WhatsApp number
- Must be registered on WhatsApp
- Must accept invitation (if required)

---

## 📋 Step-by-Step with Screenshots Description

### Screen 1: WhatsApp Manager Home
```
┌─────────────────────────────────────────┐
│ WhatsApp Manager                        │
├─────────────────────────────────────────┤
│ [Overview]                              │
│ [Message Templates]                     │
│ [Account Tools] ← Click here            │
│   └─ Phone Numbers                      │
│   └─ Business Profile                   │
│ [Insights]                              │
└─────────────────────────────────────────┘
```

### Screen 2: Phone Numbers List
```
┌─────────────────────────────────────────┐
│ Phone Numbers                           │
├─────────────────────────────────────────┤
│ +1 555 639 3449 ← Click this            │
│ Status: Development                     │
│ Phone Number ID: 1169752749545559       │
└─────────────────────────────────────────┘
```

### Screen 3: Phone Number Details
```
┌─────────────────────────────────────────┐
│ Phone Number: +1 555 639 3449           │
├─────────────────────────────────────────┤
│ Display Name: [Your Business Name]      │
│ Status: Development                     │
│                                         │
│ [Scroll down to find...]                │
│                                         │
│ Test Recipients                         │
│ ┌─────────────────────────────────────┐ │
│ │ Add phone numbers to test messaging │ │
│ │                                     │ │
│ │ [Add Recipient] ← Click here        │ │
│ │                                     │ │
│ │ Current Recipients:                 │ │
│ │ • 919901366449                      │ │
│ │ • (empty)                           │ │
│ │ • (empty)                           │ │
│ │ • (empty)                           │ │
│ │ • (empty)                           │ │
│ └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

### Screen 4: Add Recipient Dialog
```
┌─────────────────────────────────────────┐
│ Add Test Recipient                      │
├─────────────────────────────────────────┤
│ Phone Number:                           │
│ ┌─────────────────────────────────────┐ │
│ │ 919901366449                        │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Format: Country code + number          │
│ Example: 919901366449                  │
│                                         │
│ [Cancel]  [Add] ← Click Add             │
└─────────────────────────────────────────┘
```

---

## ✅ Verification

### How to Check if Number is Added

1. Go back to: **Phone Numbers** → **Your Number**
2. Scroll to: **Test Recipients**
3. You should see the number listed
4. Status should show: **"Active"** or **"Pending"**

### Test the Number

1. Go to: http://localhost:3000/admin/test-booking-template
2. Enter the test number
3. Click: **"Send Test Message"**
4. Check WhatsApp on that number

---

## 🔄 Managing Test Numbers

### Remove a Test Number

1. Go to: **Test Recipients** section
2. Find the number you want to remove
3. Click: **"Remove"** or **"X"** icon
4. Confirm removal

### Replace a Test Number

1. Remove old number (see above)
2. Add new number (see Step 3 above)
3. No limit on how many times you can change

### Check Status

**Statuses:**
- **Active** - Ready to receive messages
- **Pending** - Waiting for acceptance
- **Expired** - Invitation expired, need to resend

---

## 🚨 Troubleshooting

### "Cannot add recipient"

**Possible causes:**
- Already have 5 test numbers (remove one first)
- Invalid phone number format
- Number not registered on WhatsApp

**Solutions:**
- Check phone number format (no spaces, no +)
- Ensure number is on WhatsApp
- Remove unused test numbers

### "Recipient not receiving invitation"

**Possible causes:**
- Wrong phone number
- Number blocked your business
- WhatsApp not installed

**Solutions:**
- Verify phone number is correct
- Ask recipient to check WhatsApp
- Try different number

### "Message not delivered to test number"

**Possible causes:**
- Number not accepted invitation yet
- Template not approved
- API credentials wrong

**Solutions:**
- Check if invitation accepted
- Verify template status
- Test with hello_world template first

---

## 📊 Current Test Numbers

**Your Test Numbers:**
```
1. 919901366449 (Your number)
2. _____________ (Add more)
3. _____________ (Add more)
4. _____________ (Add more)
5. _____________ (Add more)
```

**Recommended Test Numbers:**
- Your personal number
- Team member numbers
- Test phone numbers
- Customer service number
- Developer test numbers

---

## 🎯 Best Practices

### Choose Test Numbers Wisely

**Good choices:**
- ✅ Your own number (easy to verify)
- ✅ Team members (for testing)
- ✅ Dedicated test numbers
- ✅ Numbers you control

**Avoid:**
- ❌ Customer numbers (not in production yet)
- ❌ Random numbers
- ❌ Numbers you can't access

### Test Thoroughly

**Test scenarios:**
1. Booking confirmation message
2. Different phone number formats
3. Different times of day
4. Message delivery speed
5. Message formatting on mobile

### Document Test Numbers

Keep a list of:
- Which numbers are added
- Who owns each number
- Purpose of each test number
- When added/removed

---

## 🚀 After Adding Test Numbers

### What You Can Do

**Immediate testing:**
- ✅ Test booking confirmation template
- ✅ Test hello_world template
- ✅ Test phone number formatting
- ✅ Test message delivery
- ✅ Test error handling

**What you CANNOT do:**
- ❌ Message real customers (need production mode)
- ❌ Message more than 5 numbers
- ❌ Send high volume messages

### Next Steps

1. **Add 5 test numbers** (today)
2. **Test thoroughly** (this week)
3. **Start business verification** (parallel)
4. **Move to production** (when verified)

---

## 💡 Pro Tips

### Tip 1: Use Team Numbers
Add your team's numbers so everyone can test

### Tip 2: Test Different Scenarios
- Indian numbers (91)
- International numbers
- Different formats
- Edge cases

### Tip 3: Keep One Slot Free
Always keep 1 slot available for quick testing with new numbers

### Tip 4: Document Everything
Keep notes on what works and what doesn't

### Tip 5: Test Before Production
Thoroughly test with these 5 numbers before going to production

---

## 📞 Quick Reference

| Action | Where | What to Click |
|--------|-------|---------------|
| Add number | WhatsApp Manager → Phone Numbers → Your Number | Add Recipient |
| Remove number | Test Recipients section | Remove/X icon |
| Check status | Test Recipients section | View list |
| Test message | http://localhost:3000/admin/test-booking-template | Send Test Message |

---

## ✅ Checklist

- [ ] Opened WhatsApp Manager
- [ ] Found Phone Numbers section
- [ ] Selected your phone number
- [ ] Found Test Recipients section
- [ ] Added first test number (your number)
- [ ] Added team member numbers
- [ ] Tested with hello_world template
- [ ] Tested with booking_confirmation template
- [ ] Verified messages received
- [ ] Documented test numbers

---

## 🎉 You're Ready!

Once you've added test numbers:
1. ✅ Test immediately with those numbers
2. ✅ Continue development
3. ✅ Start business verification (parallel)
4. ✅ Move to production when ready

**Add test numbers now**: https://business.facebook.com/

---

**Last Updated**: May 24, 2026  
**Limitation**: 5 test numbers maximum  
**Solution**: Production mode for unlimited numbers
