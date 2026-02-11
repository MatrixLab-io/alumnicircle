# Firebase Console Configuration - Email Verification Redirect

## Problem
Email verification still shows the default Firebase page instead of redirecting to your custom AlumniCircle page.

## Solution
You need to configure Firebase Console to use your custom action handler URL.

---

## Step-by-Step Configuration

### 1. Open Firebase Console

1. Go to https://console.firebase.google.com/
2. Select your project: **alumni-circle-03**

### 2. Navigate to Authentication Settings

1. In the left sidebar, click **Authentication**
2. Click the **Templates** tab at the top
3. You'll see a list of email templates

### 3. Configure Email Verification Template

1. Find **Email address verification** in the list
2. Click the **pencil icon** (Edit) on the right side

### 4. Customize Action URL

You'll see the email template editor. Look for the section that says:

**"Customize action URL"** or **"Action URL"**

There are two options:

#### Option A: For Development (localhost)

1. Check/Enable **"Customize action URL"**
2. In the URL field, enter:
   ```
   http://localhost:5173/auth/action
   ```
3. Click **Save**

#### Option B: For Production (after deployment)

1. Check/Enable **"Customize action URL"**
2. In the URL field, enter:
   ```
   https://yourdomain.com/auth/action
   ```
   Replace `yourdomain.com` with your actual domain
3. Click **Save**

### 5. Add Both Domains (Recommended)

**Note:** Firebase only allows ONE action URL per template. For development + production:

**During Development:**
- Use: `http://localhost:5173/auth/action`

**When Deploying:**
- Update to: `https://yourdomain.com/auth/action`

**Alternative (if you need both):**
- Use production URL in Firebase Console
- Test locally by temporarily changing the template

### 6. Verify Authorized Domains

1. Still in **Authentication** → **Settings**
2. Click the **Authorized domains** tab
3. Make sure these domains are listed:
   - `localhost` (for development)
   - `alumni-circle-03.firebaseapp.com` (default Firebase domain)
   - Your production domain (when you deploy)

4. If `localhost` is missing:
   - Click **Add domain**
   - Enter: `localhost`
   - Click **Add**

### 7. Test the Configuration

1. **Clear browser cache** (important!)
   - Chrome: `Cmd/Ctrl + Shift + Delete` → Clear cached images and files
   - Or use Incognito/Private mode

2. Register a new test account
   - Use a different email than before
   - Or use email+test@gmail.com trick (Gmail ignores +anything)

3. Check your email for the verification link

4. Click the verification link

5. **Expected behavior:**
   - ✅ You should see your custom AlumniCircle page with purple gradient
   - ✅ Success message: "Email Verified!"
   - ✅ Auto-redirect to sign-in after 2 seconds
   - ❌ Should NOT see the Firebase default blue page

---

## Troubleshooting

### Still Seeing Firebase Page?

**1. Cache Issue:**
The old Firebase page might be cached. Try:
- Open in **Incognito/Private** mode
- Clear browser cache completely
- Use a different browser
- Use a different email address

**2. Verify Action URL is Saved:**
- Go back to Firebase Console → Authentication → Templates
- Edit Email Verification template
- Check if your custom URL is there
- If not, enter it again and **click Save**

**3. URL Format:**
Make sure the URL is **exactly**:
```
http://localhost:5173/auth/action
```

**Not:**
- ~~http://localhost:5173/auth/action/~~ (no trailing slash)
- ~~http://localhost:5173/login~~ (wrong path)
- ~~https://localhost:5173~~ (wrong protocol for localhost)

**4. Check Environment Variable:**
Make sure `.env` has:
```env
VITE_APP_URL=http://localhost:5173
```

**5. Restart Dev Server:**
After any changes:
```bash
# Stop server (Ctrl+C)
npm run dev
```

---

## Alternative: Embed Custom Redirect in Email

If Firebase Console customization isn't working, you can modify the code to handle the default Firebase flow:

### Edit AuthContext.jsx:

```javascript
const actionCodeSettings = {
  url: (import.meta.env.VITE_APP_URL || 'http://localhost:5173') + '/login?verified=true',
  handleCodeInApp: false, // Change to false
};
```

This makes the verification complete on Firebase's page, but the **Continue** button will redirect to your login page.

**Pros:**
- Simpler setup
- Works without Firebase Console changes

**Cons:**
- Still shows Firebase page briefly
- Less branded experience

---

## Production Deployment Notes

### Before Deploying:

1. **Update Firebase Template:**
   - Change action URL to: `https://yourdomain.com/auth/action`

2. **Update .env:**
   ```env
   VITE_APP_URL=https://yourdomain.com
   ```

3. **Add Production Domain:**
   - Firebase Console → Authentication → Authorized domains
   - Add: `yourdomain.com`

4. **Test Thoroughly:**
   - Test email verification on production
   - Verify redirect works correctly

---

## Current URLs Reference

| Environment | Action URL | App URL |
|-------------|-----------|---------|
| Development | `http://localhost:5173/auth/action` | `http://localhost:5173` |
| Production | `https://yourdomain.com/auth/action` | `https://yourdomain.com` |

---

## What This Configuration Does

1. User clicks verification link in email
2. Instead of going to Firebase's default page (`https://alumni-circle-03.firebaseapp.com/__/auth/action`)
3. They go to your custom page (`http://localhost:5173/auth/action`)
4. Your page handles the verification with custom branding
5. Auto-redirects to sign-in with success message

---

## Need Help?

If you're still seeing the Firebase page after following all steps:

1. Take a screenshot of:
   - Firebase Console → Templates → Email Verification (edit view)
   - The URL you see when clicking the verification link
   - Your browser console errors (if any)

2. Check that:
   - ✅ Custom action URL is saved in Firebase Console
   - ✅ Dev server is running on port 5173
   - ✅ Using a fresh incognito window
   - ✅ Using a new email address (not cached)

3. Try the "Alternative" method above (handleCodeInApp: false)
