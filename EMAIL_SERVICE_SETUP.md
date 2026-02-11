# Email Service Setup Guide

This guide explains how to set up email notifications for AlumniCircle, specifically for sending congratulations emails when users are approved by admins.

## Features

- ✅ **User Approval Email**: Beautiful HTML email sent when admin approves a user
- ✅ **Custom Template**: Branded email with purple gradient and clear CTAs
- ✅ **Fallback Logging**: If email service not configured, logs email details to console

## Option 1: EmailJS (Recommended - Free Tier Available)

EmailJS provides 200 free emails per month, which is perfect for small to medium communities.

### Setup Steps:

#### 1. Create EmailJS Account

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

#### 2. Add Email Service

1. Go to **Email Services** in the dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, etc.)
4. Follow the instructions to connect your email
5. Note down your **Service ID**

#### 3. Create Email Template

1. Go to **Email Templates** in the dashboard
2. Click **Create New Template**
3. Set **Template Name**: `User Approval Email`
4. Configure the template:

**Email Template Settings:**
- **Subject**: `🎉 Your AlumniCircle Account is Approved!`
- **From Name**: `AlumniCircle`
- **From Email**: (your connected email service)
- **To**: `{{to_email}}`

**Template Content:**

Click on "Edit Content" and switch to **HTML** tab, then paste this:

```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f3f4f6; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Welcome to AlumniCircle!</h1>
    </div>
    <div style="padding: 40px;">
      <p style="font-size: 18px; color: #111827; font-weight: 600;">Hi {{user_name}},</p>
      <p style="color: #374151; line-height: 1.6;">Great news! Your AlumniCircle account has been <strong style="color: #10b981;">approved</strong>. You now have full access to our alumni community.</p>

      <div style="margin: 30px 0; text-align: center;">
        <a href="{{login_url}}" style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%); color: white; text-decoration: none; font-weight: 600; border-radius: 8px;">Sign In to Your Account</a>
      </div>

      <p style="color: #6b7280; font-size: 14px;">If you have any questions, feel free to reach out to our support team.</p>
    </div>
    <div style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9333ea; font-size: 18px; font-weight: 700; margin: 0;">AlumniCircle</p>
      <p style="color: #6b7280; font-size: 13px; margin: 8px 0 0;">© 2026 AlumniCircle. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

**IMPORTANT - Template Variables:**

In the EmailJS template editor, you MUST define these variables (they're automatically replaced when sending):

- `{{to_email}}` - Recipient email address
- `{{to_name}}` - Recipient name
- `{{user_name}}` - User's full name
- `{{login_url}}` - Login page URL
- `{{app_url}}` - App base URL (optional)

**Test the Template:**
Before saving, click "Check variables" to verify all variables are recognized.

5. Click **Save**
6. Note down your **Template ID** (you'll see it in the list or URL)

#### 4. Get Public Key

1. Go to **Account** → **General**
2. Find your **Public Key**
3. Copy it

#### 5. Update Environment Variables

Add these to your `.env` file:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID_APPROVAL=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

#### 6. Restart Development Server

The EmailJS package is already installed. Just restart your dev server to load the new environment variables:

```bash
npm run dev
```

#### 7. Test

1. Register a test user
2. As admin, approve the user
3. Check the user's email for the approval notification

## Option 2: Resend (Alternative)

Resend offers 100 free emails per day and is developer-friendly.

### Setup Steps:

1. Sign up at [Resend.com](https://resend.com/)
2. Get your API key
3. Update `email.service.js` to use Resend API:

```javascript
// Install: npm install resend
import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export const sendApprovalEmail = async (userEmail, userName) => {
  const loginUrl = `${import.meta.env.VITE_APP_URL}/login`;
  const html = generateApprovalEmailHTML(userName, loginUrl);

  await resend.emails.send({
    from: 'AlumniCircle <onboarding@yourdomain.com>',
    to: userEmail,
    subject: '🎉 Your AlumniCircle Account is Approved!',
    html: html,
  });

  return true;
};
```

## Option 3: SendGrid

SendGrid offers 100 free emails per day.

### Setup Steps:

1. Sign up at [SendGrid.com](https://sendgrid.com/)
2. Get your API key
3. Update `email.service.js` to use SendGrid

## Testing Without Email Service

If you haven't set up an email service yet, the app will:
1. Log email details to the console
2. Show that an email "would be sent"
3. Continue with user approval normally

Check the browser console when approving a user to see the email details.

## Customizing the Email Template

### Modify Template Design

Edit `/src/services/email.service.js` → `generateApprovalEmailHTML()` function:

- Change colors
- Modify text
- Add/remove features list items
- Update branding

### Example Customizations:

**Change brand color from purple to blue:**
```javascript
// Replace all instances of:
background: linear-gradient(135deg, #6b21a8 0%, #9333ea 100%);
// With:
background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
```

**Add social media links:**
```html
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
  <tr>
    <td align="center" style="padding: 20px 0;">
      <a href="https://facebook.com/your-page" style="margin: 0 10px;">Facebook</a>
      <a href="https://twitter.com/your-handle" style="margin: 0 10px;">Twitter</a>
    </td>
  </tr>
</table>
```

## Troubleshooting

### 422 Error - Invalid Request (Most Common)

If you see `422 Error` in the console when approving a user:

**Cause:** EmailJS can't process the request. Usually means:
- Service ID is incorrect
- Template ID is incorrect
- Email service not connected
- Template variables don't match

**Solution:**

1. **Verify Service ID:**
   - Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
   - Click on **Email Services**
   - Copy your Service ID (e.g., `service_abc123`)
   - Update `.env`: `VITE_EMAILJS_SERVICE_ID=service_abc123`

2. **Verify Template ID:**
   - Go to **Email Templates**
   - Find your approval email template
   - Copy the Template ID (e.g., `template_xyz456`)
   - Update `.env`: `VITE_EMAILJS_TEMPLATE_ID_APPROVAL=template_xyz456`

3. **Verify Public Key:**
   - Go to **Account** → **General**
   - Copy your Public Key (e.g., `abcdefghijklmno`)
   - Update `.env`: `VITE_EMAILJS_PUBLIC_KEY=abcdefghijklmno`

4. **Check Email Service Connection:**
   - Go to **Email Services**
   - Make sure your email service (Gmail, Outlook, etc.) shows "Connected"
   - If not connected, click "Connect" and follow the OAuth flow
   - **Important:** Gmail requires "Less secure app access" or App Password

5. **Verify Template Variables:**
   - In your EmailJS template, make sure these variables exist:
     - `{{to_email}}`
     - `{{to_name}}`
     - `{{user_name}}`
     - `{{login_url}}`
   - They should be used in your template HTML

6. **Test in EmailJS Dashboard:**
   - Go to your template
   - Click "Test It"
   - Enter test values for all variables
   - Click "Send Test Email"
   - If this fails, the issue is with your EmailJS setup

7. **Restart Dev Server:**
   After updating `.env`:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Email not sending

1. **Check environment variables**: Ensure all EmailJS vars are set in `.env`
2. **Check console**: Look for error messages
3. **Verify EmailJS dashboard**: Check if emails are appearing in your EmailJS dashboard
4. **Email limits**: Make sure you haven't exceeded free tier limits (200/month for EmailJS)

### Email goes to spam

1. Use a custom domain email (not Gmail)
2. Set up SPF and DKIM records
3. Add sender to email whitelist
4. Test with different email providers

### Template not rendering correctly

1. Test HTML in a browser first
2. Check that all variables are being replaced
3. Some email clients block certain styles - test with Gmail, Outlook, etc.

## Production Considerations

### For Production Deployment:

1. **Use a custom domain**: Instead of `noreply@gmail.com`, use `noreply@yourdomain.com`
2. **Upgrade email service**: Consider paid tier for higher limits
3. **Monitor email delivery**: Set up tracking and analytics
4. **Add unsubscribe link**: Required for bulk emails
5. **GDPR compliance**: Ensure email consent is obtained

### Recommended Services for Production:

- **AWS SES**: Very cheap, $0.10 per 1000 emails
- **SendGrid**: Reliable, good free tier
- **Resend**: Developer-friendly, modern API
- **Mailgun**: Powerful, enterprise-ready

## Future Enhancements

Consider adding emails for:
- Welcome email after registration
- Event registration confirmation
- Event reminder (24 hours before)
- Password reset (already handled by Firebase)
- Account rejection notification
- Weekly digest of new events

## Support

If you need help setting up the email service:
1. Check EmailJS documentation: https://www.emailjs.com/docs/
2. Review console logs for error messages
3. Test with a simple email first
4. Verify environment variables are loaded correctly

## Email Preview

Your users will receive a beautiful branded email that looks like this:

- Purple gradient header with "🎉 Welcome to AlumniCircle!"
- Personalized greeting
- Clear approval message
- Feature list in a styled box
- Prominent "Sign In to Your Account" button
- Footer with branding

The email is fully responsive and looks great on mobile devices.
