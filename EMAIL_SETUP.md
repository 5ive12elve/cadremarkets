# Email Notification Setup for Cadre Markets

This document explains how to set up email notifications for new orders in the Cadre Markets application.

## Overview

When a customer places an order successfully, the system will automatically send an email notification to `support@cadremarkets.com` with all the order details.

## Email Configuration

### 1. Environment Variables

Add the following environment variables to your `.env` file in the `api` directory:

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=your-app-password
```

### 2. Gmail App Password Setup

To use Gmail for sending emails, you need to:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Navigate to Security
   - Under "2-Step Verification", click on "App passwords"
   - Generate a new app password for "Mail"
   - Use this password in the `EMAIL_PASS` environment variable

### 3. Alternative Email Services

You can modify the `createTransporter` function in `api/utils/emailService.js` to use other email services like:
- Outlook/Hotmail
- Yahoo
- Custom SMTP server

## Email Content

The email notification includes:

- **Order ID** (e.g., CM12345)
- **Order Date and Time** (Cairo timezone)
- **Customer Information**:
  - Name
  - Phone number
  - Email address
  - Shipping address
  - Payment method
- **Order Items**:
  - Item name and description
  - Price and quantity
  - Item type and seller information
  - Size (for clothing items)
  - Dimensions (for artwork)
- **Order Summary**:
  - Subtotal
  - Shipping fee
  - Total amount
  - Cadre profit (10% commission)
- **Notes** (if provided by customer)

## Testing

### Test Email Configuration

You can test if the email configuration is working by making a GET request to:

```
GET /api/orders/test-email
```

This will verify that the email credentials are correct and the service can connect.

### Test Order Email

To test the actual order notification email:

1. Place a test order through the checkout process
2. Check if an email is sent to `support@cadremarkets.com`
3. Verify all order details are included in the email

## Troubleshooting

### Common Issues

1. **"Invalid credentials" error**:
   - Make sure you're using an App Password, not your regular Gmail password
   - Verify 2-Factor Authentication is enabled

2. **"Less secure app access" error**:
   - Gmail no longer supports less secure apps
   - Use App Passwords instead

3. **Email not sending**:
   - Check the server logs for error messages
   - Verify environment variables are set correctly
   - Test the email configuration endpoint

### Logs

Email sending attempts are logged in the server console:
- Success: "Order notification email sent successfully"
- Failure: "Failed to send order notification email" with error details

## Security Notes

- Never commit email credentials to version control
- Use environment variables for all sensitive information
- Consider using a dedicated email service (SendGrid, Mailgun, etc.) for production
- Regularly rotate app passwords

## Production Recommendations

For production deployment:

1. **Use a dedicated email service** like SendGrid, Mailgun, or AWS SES
2. **Set up email templates** for consistent branding
3. **Implement email queuing** for high-volume scenarios
4. **Add email delivery tracking**
5. **Set up email bounce handling**

## File Structure

```
api/
├── utils/
│   └── emailService.js          # Email service implementation
├── controllers/
│   └── order.controller.js      # Order creation with email notification
└── routes/
    └── order.route.js           # Email test endpoint
```

## API Endpoints

- `POST /api/orders` - Create order (automatically sends email)
- `GET /api/orders/test-email` - Test email configuration 