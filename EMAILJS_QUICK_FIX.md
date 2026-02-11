# EmailJS 422 Error - Quick Fix Guide

## The Error
```
Failed to load resource: the server responded with a status of 422
Error sending approval email: EmailJSResponseStatus
```

## Quick Fix Checklist

### ✅ Step 1: Verify Your EmailJS Setup

1. Go to https://dashboard.emailjs.com/
2. Make sure you're logged in

### ✅ Step 2: Check Email Service Connection

1. Click **Email Services** in the left sidebar
2. You should see your email service (Gmail, Outlook, etc.)
3. Status should show **"Connected"** in green
4. **If not connected:**
   - Click on your service
   - Click "Connect Account"
   - Follow the OAuth flow to authorize EmailJS
   - **For Gmail:** You may need to enable "Less secure app access" or create an App Password

### ✅ Step 3: Get Correct Service ID

1. Still in **Email Services**
2. Click on your connected service
3. Copy the **Service ID** (looks like `service_abc123`)
4. Update your `.env` file:
   ```env
   VITE_EMAILJS_SERVICE_ID=service_abc123
   ```

### ✅ Step 4: Create/Fix Template

1. Click **Email Templates** in the left sidebar
2. Either click **Create New Template** or edit existing one

#### Template Settings:
- **Name**: User Approval Email
- **Subject**: `🎉 Your AlumniCircle Account is Approved!`
- **From Name**: AlumniCircle
- **To Email**: `{{to_email}}`

#### Template Content (HTML):
Switch to HTML tab and paste:

```html
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; padding: 20px; background: #f3f4f6;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 16px;">
    <h1 style="color: #6b21a8; text-align: center;">🎉 Welcome to AlumniCircle!</h1>
    <p style="font-size: 18px;">Hi {{user_name}},</p>
    <p>Great news! Your AlumniCircle account has been <strong>approved</strong>. You now have full access to our alumni community.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{login_url}}" style="display: inline-block; padding: 14px 32px; background: #6b21a8; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Sign In to Your Account</a>
    </div>
    <p style="color: #666; font-size: 14px;">If you have any questions, contact our support team.</p>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
    <p style="text-align: center; color: #9333ea; font-weight: 700;">AlumniCircle</p>
  </div>
</body>
</html>
```

3. **IMPORTANT:** Verify these variables are used in your template:
   - `{{to_email}}`
   - `{{user_name}}`
   - `{{login_url}}`

4. Click **Save**
5. Copy the **Template ID** (looks like `template_xyz456`)

### ✅ Step 5: Get Public Key

1. Click your name/avatar in top right
2. Click **Account** → **General**
3. Find **Public Key** (looks like `abcdefghijklmno`)
4. Copy it

### ✅ Step 6: Update .env File

Open `/Users/imtiaz/Sites/alumnicircle/.env` and update:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_abc123     # Your Service ID
VITE_EMAILJS_TEMPLATE_ID_APPROVAL=template_xyz456  # Your Template ID
VITE_EMAILJS_PUBLIC_KEY=abcdefghijklmno    # Your Public Key
```

**Replace the values** with your actual IDs from EmailJS dashboard!

### ✅ Step 7: Restart Dev Server

```bash
# Stop the current server (Ctrl+C or Cmd+C)
npm run dev
```

### ✅ Step 8: Test

1. Register a test user in your app
2. As admin, go to User Approvals
3. Approve the test user
4. **Check browser console** for detailed logs
5. **Check user's email** for the approval message

## What You Should See in Console

### ✅ Success:
```
📧 Sending Approval Email via EmailJS
To: user@example.com
Service ID: service_abc123
Template ID: template_xyz456
Template Params: {...}
✅ Approval email sent successfully to: user@example.com
```

### ❌ Still Getting 422:

**Double-check:**
1. Service ID matches EmailJS dashboard
2. Template ID matches EmailJS dashboard
3. Public Key is correct
4. Email service is **Connected** (not just added)
5. Template has all required variables: `{{to_email}}`, `{{user_name}}`, `{{login_url}}`

**Test in EmailJS Dashboard:**
1. Go to your template
2. Click "Test It"
3. Fill in test values:
   - `to_email`: your@email.com
   - `user_name`: Test User
   - `login_url`: http://localhost:5173/login
4. Click "Send Test Email"
5. If this **fails**, your EmailJS setup has an issue
6. If this **works**, check your `.env` file again

## Still Not Working?

### Option 1: Use Console Logging (No EmailJS)

Just remove or comment out the EmailJS variables from `.env`:
```env
# VITE_EMAILJS_SERVICE_ID=
# VITE_EMAILJS_TEMPLATE_ID_APPROVAL=
# VITE_EMAILJS_PUBLIC_KEY=
```

The app will log email details to console instead. User approval still works!

### Option 2: Try Different Email Service

Instead of EmailJS, you can use:
- **Resend** (100 emails/day free): https://resend.com/
- **SendGrid** (100 emails/day free): https://sendgrid.com/
- **Mailgun**: https://www.mailgun.com/

See `EMAIL_SERVICE_SETUP.md` for alternatives.

## Need More Help?

1. Check full setup guide: `EMAIL_SERVICE_SETUP.md`
2. Check EmailJS documentation: https://www.emailjs.com/docs/
3. EmailJS support: https://www.emailjs.com/docs/user-guide/FAQ/

## Common Mistakes

❌ Using `service_id` instead of actual Service ID
✅ Use: `service_abc123` (from your dashboard)

❌ Using `template_id` instead of actual Template ID
✅ Use: `template_xyz456` (from your dashboard)

❌ Email service shows "Not Connected"
✅ Click "Connect" and complete OAuth flow

❌ Template doesn't have all required variables
✅ Must include: `{{to_email}}`, `{{user_name}}`, `{{login_url}}`

❌ Forgot to restart dev server after changing `.env`
✅ Always restart: `npm run dev`
