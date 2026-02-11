# Firebase Email Action Handler Setup

This guide explains how to configure Firebase to redirect users to your custom email action handler after email verification.

---

## ⚠️ IMPORTANT: Still Seeing Firebase Default Page?

**You need to configure Firebase Console!**

👉 **Follow this guide:** `FIREBASE_CONSOLE_SETUP.md`

**Quick Steps:**
1. Go to https://console.firebase.google.com/
2. Select project: **alumni-circle-03**
3. Go to **Authentication → Templates**
4. Edit **Email address verification**
5. Enable **"Customize action URL"**
6. Enter: `http://localhost:5173/auth/action`
7. Click **Save**
8. Test with new email in incognito mode

---

## What We've Implemented

1. **Custom Email Action Handler Page** (`/auth/action`)
   - Processes email verification links
   - Shows success/error messages
   - Auto-redirects to sign-in page after 2 seconds

2. **Updated `actionCodeSettings`** in `AuthContext.jsx`
   - Points to `/auth/action` instead of `/login`
   - Uses `handleCodeInApp: true` for seamless redirect

## Firebase Console Configuration

To complete the setup, you need to configure Firebase to use your custom domain for email action links:

### Step 1: Add Authorized Domain

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **alumni-circle-03**
3. Go to **Authentication** → **Settings** → **Authorized domains**
4. Add your production domain (e.g., `yourdomain.com`)
5. For local development, `localhost` should already be there

### Step 2: Configure Custom Email Action Handler (Optional but Recommended)

1. In Firebase Console, go to **Authentication** → **Templates**
2. Click on **Email address verification**
3. In the **Customize action URL** section:
   - Enable **Customize action URL**
   - Enter your URL: `https://yourdomain.com/auth/action` (or `http://localhost:5173/auth/action` for development)
4. Click **Save**

### Step 3: Update Environment Variables

Make sure your `.env` file has the correct app URL:

```env
VITE_APP_URL=http://localhost:5173  # For development
# VITE_APP_URL=https://yourdomain.com  # For production
```

## How It Works

### Email Verification Flow:

1. User registers → receives verification email
2. User clicks link in email → redirected to `/auth/action?mode=verifyEmail&oobCode=...`
3. `EmailAction.jsx` page:
   - Shows loading spinner
   - Verifies the code with Firebase
   - Shows success message
   - Auto-redirects to `/login?verified=true` after 2 seconds
4. Login page shows success toast: "Email verified successfully! Please sign in."

### Password Reset Flow:

1. User requests password reset → receives email
2. User clicks link → redirected to `/auth/action?mode=resetPassword&oobCode=...`
3. `EmailAction.jsx` redirects to password reset page with the code

## Testing

### Local Testing:
1. Start dev server: `npm run dev`
2. Register a new account
3. Check console for verification link (if email sending is not configured)
4. Click the link → should redirect to your custom handler
5. After verification → auto-redirect to sign-in

### Production Testing:
1. Deploy your app
2. Update Firebase email templates with production URL
3. Register and verify email
4. Verify the redirect works correctly

## Customization

You can customize the email action handler in `/src/pages/auth/EmailAction.jsx`:
- Change redirect delay (currently 2 seconds)
- Modify success/error messages
- Add custom branding
- Handle other email actions (password reset, email change, etc.)

## Troubleshooting

**Issue:** Still seeing Firebase default page after clicking verification link

**Solutions:**
1. Clear browser cache and cookies
2. Verify `VITE_APP_URL` is set correctly in `.env`
3. Check Firebase Console → Authentication → Templates → Email address verification
4. Ensure authorized domains include your domain
5. Rebuild the app: `npm run build`

**Issue:** Verification link doesn't work

**Solutions:**
1. Check browser console for errors
2. Verify the `oobCode` parameter is in the URL
3. Make sure the link hasn't expired (valid for 24 hours)
4. Check Firebase Authentication logs

## Additional Notes

- Email verification links expire after 24 hours
- Users can request a new verification email from the VerifyEmail page
- The custom handler supports multiple action modes (verify, reset password, etc.)
- For production, consider using Firebase Email Extensions for better email delivery
