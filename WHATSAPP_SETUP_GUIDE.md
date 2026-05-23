# WhatsApp Business API Setup Guide

## Overview
This guide will help you set up WhatsApp Business API integration for sending booking confirmation messages to customers.

## Prerequisites
- Meta Business Manager account
- WhatsApp Business Account
- Verified phone number for WhatsApp Business

## Step 1: Set up WhatsApp Business API

### 1.1 Access Meta Business Manager
1. Go to [business.facebook.com](https://business.facebook.com)
2. Log in with your Facebook account
3. Select your business account or create a new one

### 1.2 Add WhatsApp Business Account
1. In Business Manager, go to "Business Settings"
2. Click "Accounts" → "WhatsApp Business Accounts"
3. Click "Add" → "Create a WhatsApp Business Account"
4. Follow the setup wizard

### 1.3 Get API Credentials
1. Go to "WhatsApp Business Accounts" in Business Settings
2. Select your WhatsApp Business Account
3. Note down:
   - **Business Account ID**: Found in the account overview
   - **Phone Number ID**: Go to "Phone Numbers" tab, copy the ID
   - **Access Token**: Go to "System Users" → Create/Select user → Generate token

## Step 2: Configure Environment Variables

Add these to your `.env.local` file:

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id_here
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id_here
```

## Step 3: Create Message Template

### 3.1 Access Template Library
1. In Meta Business Manager, go to WhatsApp Manager
2. Click "Message Templates" in the left sidebar
3. Click "Create Template"

### 3.2 Create Booking Confirmation Template
Create a template with these details:

**Template Name**: `booking_confirmation`
**Category**: `UTILITY`
**Language**: `English (US)`

**Template Content**:
```
Hello {{1}},

Your booking has been confirmed! 🚗

📋 Booking Details:
• Booking ID: {{2}}
• From: {{3}}
• To: {{4}}
• Date & Time: {{5}}
• Vehicle: {{6}}
• Total Amount: {{7}}

We'll contact you 30 minutes before pickup. Have a safe journey!

- AirlinCabz Team
```

**Parameter Mapping**:
1. {{1}} = Customer Name
2. {{2}} = Booking ID
3. {{3}} = Pickup Location
4. {{4}} = Dropoff Location
5. {{5}} = Pickup Date & Time
6. {{6}} = Vehicle Type
7. {{7}} = Total Amount

### 3.3 Submit for Approval
1. Review your template
2. Click "Submit" 
3. Wait for Meta's approval (usually 24-48 hours)

## Step 4: Test the Integration

### 4.1 Use Test Panel
1. Go to `/admin/whatsapp-test` in your application
2. Enter a test phone number
3. Send a test message
4. Verify the message is received

### 4.2 Test Booking Flow
1. Create a test booking through your website
2. Check if WhatsApp notification is sent
3. Verify the message format and content

## Step 5: Phone Number Verification

### 5.1 Add Test Numbers
1. In WhatsApp Manager, go to "Phone Numbers"
2. Click on your phone number
3. Go to "Messaging" tab
4. Add test phone numbers in "Send and receive messages"

### 5.2 Go Live
1. Complete business verification
2. Add payment method
3. Request to remove test number restrictions

## Troubleshooting

### Common Issues

**1. "Invalid phone number" error**
- Ensure phone number includes country code (91 for India)
- Remove any spaces, dashes, or special characters
- Format: 919876543210

**2. "Template not found" error**
- Verify template name matches exactly: `booking_confirmation`
- Ensure template is approved by Meta
- Check template language code: `en_US`

**3. "Access token invalid" error**
- Regenerate access token in Business Manager
- Ensure token has WhatsApp Business messaging permissions
- Check if token hasn't expired

**4. "Phone number not verified" error**
- Complete phone number verification in WhatsApp Manager
- Add recipient numbers to test list during development

### Debug Steps
1. Check server logs for detailed error messages
2. Use the test panel to isolate issues
3. Verify all environment variables are set correctly
4. Test with a simple text message first

## Production Considerations

### 1. Rate Limits
- WhatsApp has messaging rate limits
- Implement retry logic with exponential backoff
- Monitor usage in Meta Business Manager

### 2. Message Templates
- Create templates for different scenarios:
  - Booking confirmation
  - Booking cancellation
  - Pickup reminders
  - Payment confirmations

### 3. Error Handling
- Log all WhatsApp API errors
- Implement fallback notifications (email/SMS)
- Don't fail booking creation if WhatsApp fails

### 4. Compliance
- Follow WhatsApp Business Policy
- Only send messages to opted-in customers
- Provide opt-out mechanism
- Respect messaging windows (24 hours after customer interaction)

## Support Resources
- [WhatsApp Business API Documentation](https://developers.facebook.com/docs/whatsapp)
- [Meta Business Help Center](https://www.facebook.com/business/help)
- [WhatsApp Business Policy](https://www.whatsapp.com/legal/business-policy)