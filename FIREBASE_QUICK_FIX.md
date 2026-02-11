# Firebase Email Redirect - Quick Fix

## Problem
Still seeing Firebase default page when clicking email verification link.

## Solution (2 Minutes)

### Step 1: Open Firebase Console
```
https://console.firebase.google.com/
```

### Step 2: Select Your Project
Click on: **alumni-circle-03**

### Step 3: Go to Email Templates
Left sidebar → **Authentication** → **Templates** tab

### Step 4: Edit Email Verification
Find "Email address verification" → Click **✏️ Edit**

### Step 5: Customize URL
Look for **"Customize action URL"** section:

1. ✅ **Check/Enable** the checkbox
2. **Enter this URL:**
   ```
   http://localhost:5173/auth/action
   ```
3. Click **Save**

### Step 6: Test
1. **Important:** Open **Incognito/Private** window
2. Register with a **new email** (or use `yourname+test@gmail.com`)
3. Click verification link
4. Should see **your custom purple page** ✅

---

## Exact Path in Firebase Console

```
Firebase Console
  └─ alumni-circle-03 (your project)
      └─ Build
          └─ Authentication
              └─ Templates (tab at top)
                  └─ Email address verification
                      └─ ✏️ Edit (pencil icon)
                          └─ "Customize action URL"
                              └─ [✓] Enable
                              └─ URL: http://localhost:5173/auth/action
                              └─ Save
```

---

## What to Enter

| Field | Value |
|-------|-------|
| **Checkbox** | ✅ Enabled |
| **Action URL** | `http://localhost:5173/auth/action` |

**⚠️ Important:**
- No trailing slash: ~~`/auth/action/`~~
- Use `http://` not `https://` for localhost
- Exact path: `/auth/action` (not `/login`)

---

## After Saving

1. **Clear browser cache** OR use Incognito
2. **Use new email** (old links are cached)
3. Test verification flow

---

## Expected Flow

### ❌ Before Fix:
```
Email → Click Link → Firebase Blue Page → Continue Button → Login
```

### ✅ After Fix:
```
Email → Click Link → Custom Purple Page → Auto-redirect (2s) → Login
```

---

## Still Not Working?

### Check These:

1. **URL is saved?**
   - Go back and check if URL is still there
   - Sometimes it doesn't save - try again

2. **Using incognito?**
   - Old page might be cached
   - Must use private/incognito window

3. **New email address?**
   - Old verification links use old settings
   - Use different email or `yourname+test@gmail.com`

4. **Dev server running?**
   ```bash
   npm run dev
   ```
   Should see: `http://localhost:5173`

5. **Authorized domains?**
   - Authentication → Settings → Authorized domains
   - Make sure `localhost` is listed
   - Add it if missing

---

## Alternative (if above doesn't work)

If Firebase Console isn't working, use this fallback:

### Edit: `src/contexts/AuthContext.jsx`

Change this:
```javascript
const actionCodeSettings = {
  url: (import.meta.env.VITE_APP_URL || 'http://localhost:5173') + '/auth/action',
  handleCodeInApp: true,
};
```

To this:
```javascript
const actionCodeSettings = {
  url: (import.meta.env.VITE_APP_URL || 'http://localhost:5173') + '/login?verified=true',
  handleCodeInApp: false,
};
```

**Result:**
- Will show Firebase page
- But "Continue" button goes to your login
- Not as clean but works without Firebase config

---

## Production Setup

When you deploy to production:

### Update Firebase Console:
```
Action URL: https://yourdomain.com/auth/action
```

### Update .env:
```env
VITE_APP_URL=https://yourdomain.com
```

### Add domain to Firebase:
```
Authentication → Settings → Authorized domains → Add domain
```

---

## Quick Test Checklist

- [ ] Firebase Console action URL saved
- [ ] Dev server running on localhost:5173
- [ ] Using incognito/private window
- [ ] Using new email address
- [ ] Browser cache cleared
- [ ] Clicked verification link
- [ ] Saw custom purple page (not Firebase blue)
- [ ] Auto-redirected to login
- [ ] Saw success toast

---

## Screenshots Location

If you need visual help, the Firebase Console should look like this:

**Email Templates page:**
- List of templates with Email address verification
- Pencil icon on the right to edit

**Edit Email Template:**
- Email subject and body at top
- "Customize action URL" checkbox in middle/bottom
- URL input field when enabled
- Save button at bottom

---

## Need More Help?

See full guide: `FIREBASE_CONSOLE_SETUP.md`
