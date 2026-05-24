# WhatsApp Booking Confirmation Template Setup

## Current Status
✅ WhatsApp API integration is working  
✅ Code is ready to send booking confirmations  
⏳ Need to create custom template in Meta Business Manager

## Step 1: Create Template in Meta Business Manager

1. Go to [Meta Business Manager](https://business.facebook.com/)
2. Navigate to **WhatsApp Manager** → **Message Templates**
3. Click **Create Template**

### Template Configuration (Meta-Compliant)

**Template Name:** `booking_confirmation`

**Category:** `UTILITY` (for transactional/order updates)

**Language:** English (US)

---

### HEADER (Optional but Recommended)
**Type:** TEXT

```
Booking Confirmed
```

---

### BODY (Required - Copy EXACTLY as shown)

**IMPORTANT**: Meta requires variables to be in format `{{1}}`, `{{2}}`, etc.

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

**Why this format?**
- ✅ No emojis (Meta may reject templates with excessive emojis in UTILITY category)
- ✅ Clear, professional language
- ✅ No promotional content (required for UTILITY category)
- ✅ Transactional information only
- ✅ Simple formatting (no bullet points that might render incorrectly)
- ✅ Date and Time are separate for better clarity

---

### FOOTER (Optional)
**Type:** TEXT

```
airlinecabz.com
```

**Note:** Keep footer simple - just domain name or brand name. No promotional text.

---

### BUTTONS (Optional but Recommended)

**Button 1 - Call Button:**
- Type: `PHONE_NUMBER`
- Text: `Call Us`
- Phone Number: `+919901366449`

**Button 2 - URL Button:**
- Type: `URL`
- Text: `View Booking`
- URL: `https://airlinecabz.com`

**Note:** Maximum 2 buttons allowed for UTILITY templates.

---

### Parameter Mapping
The template uses 8 parameters that will be filled automatically:
1. `{{1}}` - Customer Name (e.g., "Rajesh Kumar")
2. `{{2}}` - Booking ID (e.g., "BK-ABC123")
3. `{{3}}` - Pickup Location (e.g., "Koramangala, Bangalore")
4. `{{4}}` - Dropoff Location (e.g., "Kempegowda International Airport")
5. `{{5}}` - Pickup Date (e.g., "Monday, 26 May 2026")
6. `{{6}}` - Pickup Time (e.g., "08:30 AM")
7. `{{7}}` - Vehicle Type (e.g., "Toyota Innova Crysta")
8. `{{8}}` - Total Amount (e.g., "₹2,500")

## Step 2: Submit for Approval

### Before Submitting - Checklist

✅ **Template Name**: `booking_confirmation` (lowercase, no spaces)  
✅ **Category**: `UTILITY` (not MARKETING)  
✅ **No promotional language**: Template contains only transactional information  
✅ **Variables**: All 8 variables `{{1}}` through `{{8}}` are used  
✅ **No policy violations**: No spam, misleading content, or prohibited content  
✅ **Professional tone**: Clear, concise, business communication  

### Submission Process

1. Review your template carefully
2. Click **Submit**
3. Meta will review (usually takes 1-24 hours, sometimes up to 48 hours)
4. You'll receive an email notification when:
   - ✅ **Approved** - Template is ready to use
   - ❌ **Rejected** - Review rejection reason and resubmit

### Common Rejection Reasons & How to Avoid

| Reason | Solution |
|--------|----------|
| **Promotional content** | Remove marketing language, keep transactional only |
| **Too many emojis** | Use minimal or no emojis in UTILITY templates |
| **Unclear variables** | Ensure all variables have clear context |
| **Wrong category** | Use UTILITY for transactional, not MARKETING |
| **Policy violation** | Review [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy) |

---

## Step 3: Test the Integration

Once approved, test the booking flow:

### Option 1: Test Page (Recommended)
1. Go to: http://localhost:3000/admin/test-booking-template
2. Enter your WhatsApp number (format: 919901366449)
3. Click "Send Test Message"
4. Check your WhatsApp for the message

### Option 2: Real Booking Flow
1. Go to: http://localhost:3000/book
2. Fill in all booking details
3. Use your WhatsApp number
4. Submit the booking
5. Check WhatsApp for confirmation message

### Option 3: API Test (Advanced)
```bash
curl -X POST http://localhost:3000/api/test-booking-template \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber":"919901366449"}'
```

---

## Current Implementation

The code is already set up and ready to use the template.

### Main Function: `src/lib/whatsapp.ts`

```typescript
export async function sendWhatsAppNotification(phoneNumber: string, booking: BookingData)
```

**What it does:**
- Formats phone number automatically (handles +91, 91, or 10-digit formats)
- Formats date/time in readable format
- Sends template with all 7 parameters
- Falls back to plain text if template fails
- Logs all actions for debugging

### Auto-Called From: `src/app/api/bookings/route.ts`

```typescript
// Try sending WhatsApp notification (non-blocking)
try {
  const { sendWhatsAppNotification } = await import("@/lib/whatsapp");
  await sendWhatsAppNotification(booking.customer_phone, booking);
} catch (waError) {
  logger.logError("Failed to send WhatsApp notification", waError);
  // Don't fail the booking if notification fails
}
```

**Key Features:**
- ✅ Non-blocking: Booking succeeds even if WhatsApp fails
- ✅ Error handling: Logs errors without breaking the flow
- ✅ Automatic: No manual intervention needed

### Fallback Behavior

If the template is not found or fails, the system will automatically:
1. Detect the template error (code 132000)
2. Send a plain text message with the same information
3. Log the error for debugging
4. Customer still gets their booking confirmation

---

## Environment Variables

Current configuration in `.env.local`:
```env
WHATSAPP_ACCESS_TOKEN=EAAN9kWbFySgBRobg9CD2MXULmMZBLcfYUXYEFJQnpcNvKuTN9UVwZC4eMdwEbkh14yUPQFelg5AbuDbidWwKMVZCZAjhVIdw84KCwhZAeCpRRxaIy1crUThflxnEp2EG5heoiwSev07ZBRXotknIj6qVR7bzZB3zQArFVZBa4hryHRQibMxbNClQuu38p4910R5wRTTmYKQ2NSj7iZBUa8ZCcXcbKjysZCmLsjKTSOZA5ZA3NRpzRhiZBcubJtSw2pCGu5Xtfom8oGSHjMvuUieSLt8Y5N
WHATSAPP_PHONE_NUMBER_ID=1169752749545559
WHATSAPP_WEBHOOK_VERIFY_TOKEN=bmOGZqofF8RDJAgpv94lSMan5UsC2Kx7
```

**Security Notes:**
- ✅ Access token expires after 90 days - you'll need to regenerate
- ✅ Never commit `.env.local` to version control
- ✅ Keep tokens secure and private

---

## Troubleshooting

### Template Not Found Error
```json
{
  "error": {
    "code": 132000,
    "message": "Template not found"
  }
}
```
**Solutions:**
- Ensure template name is exactly `booking_confirmation` (case-sensitive)
- Check if template is approved in Meta Business Manager
- Verify template language is set to `en_US`
- Wait a few minutes after approval for propagation

### Message Not Delivered
```json
{
  "error": {
    "code": 133010,
    "message": "Account not registered"
  }
}
```
**Solutions:**
- Check if recipient's phone number is registered on WhatsApp
- Verify phone number format: `919901366449` (country code + number, no spaces)
- Test with your own number first
- Ensure number is not blocked

### Access Token Expired
```json
{
  "error": {
    "code": 190,
    "message": "Invalid OAuth access token"
  }
}
```
**Solutions:**
- Generate new token from Meta Business Manager
- Update `WHATSAPP_ACCESS_TOKEN` in `.env.local`
- Restart your development server

### Rate Limiting
```json
{
  "error": {
    "code": 80007,
    "message": "Rate limit hit"
  }
}
```
**Solutions:**
- WhatsApp has rate limits (varies by account tier)
- Wait a few minutes before retrying
- Consider upgrading your WhatsApp Business account
- Implement exponential backoff in production

---

## Production Checklist

Before going live:

- [ ] Template `booking_confirmation` created in Meta Business Manager
- [ ] Template approved by Meta (check email notification)
- [ ] Tested with multiple phone numbers (at least 3 different numbers)
- [ ] Verified all 7 parameters are filled correctly
- [ ] Checked message formatting on different mobile devices
- [ ] Tested fallback behavior (plain text message)
- [ ] Set up monitoring for WhatsApp API errors
- [ ] Documented access token expiry date (90 days from generation)
- [ ] Configured webhook for delivery status (optional but recommended)
- [ ] Reviewed WhatsApp Business Policy compliance
- [ ] Tested with international numbers if applicable
- [ ] Set up alerts for failed notifications

---

## API Version

Currently using: **v25.0** (latest stable version as of May 2026)

**Update Schedule:**
- Meta releases new API versions quarterly
- Old versions are deprecated after 2 years
- Monitor [Meta's API changelog](https://developers.facebook.com/docs/graph-api/changelog)

---

## Message Preview

When a customer books, they'll receive:

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

**Character Count:** ~280 characters (well within WhatsApp limits)

---

## Support & Resources

### Meta Support
- [Meta Business Help Center](https://business.facebook.com/help)
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)
- [Template Guidelines](https://developers.facebook.com/docs/whatsapp/message-templates/guidelines)

### Your Test Resources
- **Test Page**: http://localhost:3000/admin/test-booking-template
- **Hello World Test**: http://localhost:3000/admin/whatsapp-hello
- **Dashboard**: http://localhost:3000/admin/dashboard (has WhatsApp link)

### Contact
- **Test Phone**: +91 99013 66449
- **WhatsApp Business Account**: 1978125122810634
- **Phone Number ID**: 1169752749545559

---

## Advanced: Template Variations

If you need different templates for different scenarios:

### Template: `booking_cancelled`
```
Hello {{1}},

Your booking has been cancelled.

Booking ID: {{2}}
Cancellation Date: {{3}}

If you did not request this cancellation, please contact us immediately.

Thank you,
Airlinecabz Team
```

### Template: `booking_reminder`
```
Hello {{1}},

Reminder: Your ride is scheduled in 30 minutes.

Booking ID: {{2}}
Pickup Time: {{3}}
Pickup Location: {{4}}
Vehicle: {{5}}

Your driver will contact you shortly.

Airlinecabz
```

**Note:** Each template needs separate approval from Meta.

---

## Monitoring & Analytics

### Key Metrics to Track
- **Delivery Rate**: % of messages successfully delivered
- **Read Rate**: % of messages read by customers
- **Response Rate**: % of customers who respond
- **Error Rate**: % of failed message attempts
- **Template Approval Time**: How long Meta takes to approve

### Logging
All WhatsApp operations are logged in:
- Console output (development)
- Application logs via `src/lib/logger.ts`
- Check logs for debugging failed notifications

---

## Cost Considerations

### WhatsApp Business API Pricing
- **Utility Conversations**: Charged per conversation (24-hour window)
- **Pricing varies by country**: India rates differ from US/EU
- **Free Tier**: 1,000 conversations/month (check current Meta pricing)
- **Template Messages**: Count as business-initiated conversations

**Recommendation**: Monitor usage in Meta Business Manager to avoid unexpected costs.

---

## Next Steps

1. **Create the template now**: https://business.facebook.com/
2. **Wait for approval**: Check email (1-24 hours)
3. **Test immediately**: Use `/admin/test-booking-template`
4. **Monitor first week**: Check delivery rates and customer feedback
5. **Optimize**: Adjust template based on customer responses

---

## Quick Reference

| Action | URL/Command |
|--------|-------------|
| Create Template | https://business.facebook.com/ |
| Test Template | http://localhost:3000/admin/test-booking-template |
| Test Basic | http://localhost:3000/admin/whatsapp-hello |
| Dashboard | http://localhost:3000/admin/dashboard |
| API Test | `curl -X POST http://localhost:3000/api/test-booking-template -H "Content-Type: application/json" -d '{"phoneNumber":"919901366449"}'` |

---

**Last Updated**: May 24, 2026  
**API Version**: v25.0  
**Status**: Ready for template creation ✅
