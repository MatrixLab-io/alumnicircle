# AlumniCircle - School Batch 2003 Directory App

## Complete Development Plan & Documentation

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Firebase Configuration](#firebase-configuration)
4. [Project Structure](#project-structure)
5. [Database Schema](#database-schema)
6. [Authentication Flow](#authentication-flow)
7. [Application Routes](#application-routes)
8. [Component Architecture](#component-architecture)
9. [Feature Specifications](#feature-specifications)
10. [UI/UX Guidelines](#uiux-guidelines)
11. [Development Phases](#development-phases)
12. [Security Checklist](#security-checklist)
13. [SEO Configuration](#seo-configuration)
14. [Development Progress](#development-progress)

---

## Project Overview

**App Name:** AlumniCircle
**Purpose:** A comprehensive alumni directory and event management system for School Batch 2003
**Core Features:**
- Secure authentication with Google Sign-in and email/password
- Admin approval workflow for new registrations
- Member directory with privacy controls
- Event management with payment verification
- Role-based access control (User, Admin, Super Admin)

---

## Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI Library |
| Vite | 7.x | Build Tool & Dev Server |
| Tailwind CSS | 4.x | Styling with Glassmorphism |
| React Router DOM | 7.x | Client-side Routing |
| React Hook Form | 7.x | Form Handling & Validation |
| @headlessui/react | 2.x | Accessible UI Components |
| @heroicons/react | 2.x | Icon Library |

### Backend & Database
| Technology | Purpose |
|------------|---------|
| Firebase Authentication | User Auth (Google + Email/Password) |
| Firebase Firestore | NoSQL Database |
| Firebase Storage | File Storage (Photos, Banners) |
| Firebase Cloud Functions | Email Notifications, Scheduled Tasks |
| Firebase Hosting | Deployment |

### Utilities
| Package | Purpose |
|---------|---------|
| xlsx | Excel Export |
| papaparse | CSV Export |
| flatpickr | Date/Time Picker |
| react-hot-toast | Toast Notifications |
| react-helmet-async | SEO Meta Tags |

---

## Firebase Configuration

### Collections Structure

```
firestore/
├── users/                    # User profiles
├── events/                   # Active events
├── eventParticipants/        # Event registrations
├── archivedEvents/           # Completed events archive
└── adminSettings/            # App configuration
```

### Firebase Security Rules (Firestore)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isApprovedUser() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.status == 'approved';
    }

    function isAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'super_admin'];
    }

    function isSuperAdmin() {
      return isAuthenticated() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'super_admin';
    }

    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated() && (request.auth.uid == userId || isApprovedUser());
      allow create: if isAuthenticated() && request.auth.uid == userId;
      allow update: if isAuthenticated() && (request.auth.uid == userId || isAdmin());
      allow delete: if isSuperAdmin();
    }

    // Events collection
    match /events/{eventId} {
      allow read: if true; // Public events are readable
      allow create, update, delete: if isAdmin();
    }

    // Event Participants
    match /eventParticipants/{participantId} {
      allow read: if isAuthenticated() &&
        (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isApprovedUser();
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Archived Events
    match /archivedEvents/{eventId} {
      allow read: if isAdmin();
      allow write: if isAdmin();
    }
  }
}
```

### Firebase Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User profile photos
    match /users/{userId}/profile/{fileName} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Event banners
    match /events/{eventId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null; // Admin check done in app
    }

    // Archived event exports
    match /archives/{fileName} {
      allow read, write: if request.auth != null; // Admin check done in app
    }
  }
}
```

---

## Project Structure

```
alumnicircle/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── .env.local                    # Firebase config (gitignored)
├── .env.example                  # Environment template
├── PROJECT_PLAN.md               # This file
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── og-image.png              # Social share image
│
└── src/
    ├── main.jsx                  # App entry point
    ├── App.jsx                   # Root component with providers
    ├── index.css                 # Global styles & Tailwind
    │
    ├── config/
    │   ├── firebase.js           # Firebase initialization
    │   ├── constants.js          # App constants
    │   └── routes.js             # Route definitions
    │
    ├── contexts/
    │   ├── AuthContext.jsx       # Authentication state
    │   └── ThemeContext.jsx      # Dark/Light mode
    │
    ├── hooks/
    │   ├── useAuth.js            # Auth hook
    │   ├── useFirestore.js       # Firestore operations
    │   ├── useStorage.js         # Firebase Storage hook
    │   ├── useProfile.js         # Profile operations
    │   └── useEvents.js          # Event operations
    │
    ├── services/
    │   ├── auth.service.js       # Authentication API
    │   ├── user.service.js       # User CRUD operations
    │   ├── event.service.js      # Event CRUD operations
    │   └── email.service.js      # Email notifications
    │
    ├── utils/
    │   ├── helpers.js            # Utility functions
    │   ├── validators.js         # Form validation schemas
    │   ├── formatters.js         # Date, phone formatters
    │   └── exportUtils.js        # CSV/Excel export
    │
    ├── components/
    │   ├── common/
    │   │   ├── Button.jsx
    │   │   ├── Input.jsx
    │   │   ├── Select.jsx
    │   │   ├── Textarea.jsx
    │   │   ├── Checkbox.jsx
    │   │   ├── Toggle.jsx
    │   │   ├── Modal.jsx
    │   │   ├── Dropdown.jsx
    │   │   ├── Avatar.jsx
    │   │   ├── Badge.jsx
    │   │   ├── Card.jsx
    │   │   ├── Spinner.jsx
    │   │   ├── EmptyState.jsx
    │   │   ├── ErrorBoundary.jsx
    │   │   └── index.js          # Barrel export
    │   │
    │   ├── layout/
    │   │   ├── Navbar.jsx
    │   │   ├── Sidebar.jsx
    │   │   ├── Footer.jsx
    │   │   ├── PageHeader.jsx
    │   │   ├── Container.jsx
    │   │   ├── MainLayout.jsx    # User layout wrapper
    │   │   ├── AdminLayout.jsx   # Admin layout wrapper
    │   │   ├── AuthLayout.jsx    # Auth pages layout
    │   │   └── index.js
    │   │
    │   ├── auth/
    │   │   ├── LoginForm.jsx
    │   │   ├── RegisterForm.jsx
    │   │   ├── GoogleSignInButton.jsx
    │   │   ├── PasswordInput.jsx
    │   │   └── index.js
    │   │
    │   ├── profile/
    │   │   ├── ProfileCard.jsx
    │   │   ├── ProfileForm.jsx
    │   │   ├── PhotoUpload.jsx
    │   │   ├── ProfessionFields.jsx
    │   │   ├── SocialLinksForm.jsx
    │   │   ├── PrivacySettings.jsx
    │   │   ├── ProfileCompletion.jsx
    │   │   └── index.js
    │   │
    │   ├── directory/
    │   │   ├── DirectoryTable.jsx
    │   │   ├── DirectoryFilters.jsx
    │   │   ├── MemberCard.jsx
    │   │   ├── MemberModal.jsx
    │   │   ├── Pagination.jsx
    │   │   ├── SearchBar.jsx
    │   │   ├── SortDropdown.jsx
    │   │   └── index.js
    │   │
    │   ├── events/
    │   │   ├── EventCard.jsx
    │   │   ├── EventBanner.jsx
    │   │   ├── EventDetails.jsx
    │   │   ├── EventForm.jsx
    │   │   ├── JoinEventModal.jsx
    │   │   ├── PaymentModal.jsx
    │   │   ├── ParticipantList.jsx
    │   │   ├── EventFilters.jsx
    │   │   └── index.js
    │   │
    │   ├── admin/
    │   │   ├── StatsCard.jsx
    │   │   ├── UserApprovalTable.jsx
    │   │   ├── UserApprovalRow.jsx
    │   │   ├── ParticipantApprovalTable.jsx
    │   │   ├── AdminTable.jsx
    │   │   ├── AdminModal.jsx
    │   │   └── index.js
    │   │
    │   └── theme/
    │       ├── ThemeToggle.jsx
    │       └── index.js
    │
    └── pages/
        ├── public/
        │   ├── Landing.jsx
        │   ├── PublicEvent.jsx
        │   └── NotFound.jsx
        │
        ├── auth/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── VerifyEmail.jsx
        │   ├── PendingApproval.jsx
        │   ├── ForgotPassword.jsx
        │   └── ResetPassword.jsx
        │
        ├── user/
        │   ├── Dashboard.jsx
        │   ├── Profile.jsx
        │   ├── EditProfile.jsx
        │   ├── Directory.jsx
        │   ├── Events.jsx
        │   ├── EventDetails.jsx
        │   └── MyEvents.jsx
        │
        └── admin/
            ├── AdminDashboard.jsx
            ├── UserApprovals.jsx
            ├── CreateEvent.jsx
            ├── EditEvent.jsx
            ├── ManageEvents.jsx
            ├── EventParticipants.jsx
            ├── ManageAdmins.jsx
            └── AllUsers.jsx
```

---

## Database Schema

### Users Collection

```typescript
interface User {
  uid: string;                    // Firebase Auth UID
  email: string;                  // Required, unique
  name: string;                   // Required
  phone: string;                  // Required
  phoneVisibility: 'public' | 'private';  // Default: 'private'
  emailVisibility: 'public' | 'private';  // Default: 'public'
  nameVisibility: 'public' | 'private';   // Default: 'public'

  role: 'user' | 'admin' | 'super_admin'; // Default: 'user'
  status: 'pending' | 'approved' | 'rejected'; // Default: 'pending'

  // Profile fields
  photo: string | null;           // Firebase Storage URL
  bloodGroup: string | null;      // A+, A-, B+, B-, AB+, AB-, O+, O-

  profession: {
    type: 'business' | 'service' | 'other' | null;
    businessName: string | null;  // If type === 'business'
    designation: string | null;   // If type === 'service'
    companyName: string | null;   // If type === 'service'
    otherDetails: string | null;  // If type === 'other'
  } | null;

  address: {
    street: string | null;
    city: string | null;
    country: string | null;
  } | null;

  socialLinks: {
    facebook: string | null;
    linkedin: string | null;
    twitter: string | null;
    website: string | null;
  } | null;

  profileCompletion: number;      // 0-100 percentage

  // Timestamps
  createdAt: Timestamp;
  updatedAt: Timestamp;
  approvedAt: Timestamp | null;
  approvedBy: string | null;      // Admin UID who approved
  lastLoginAt: Timestamp | null;
}
```

### Events Collection

```typescript
interface Event {
  id: string;                     // Auto-generated
  banner: string | null;          // Firebase Storage URL
  title: string;                  // Required
  description: string;            // Required (rich text)
  location: string;               // Required

  startDate: Timestamp;           // Event start
  endDate: Timestamp;             // Event end
  registrationDeadline: Timestamp | null;

  participantLimit: number | null; // null = unlimited
  currentParticipants: number;    // Counter

  registrationFee: number;        // 0 = free
  bkashNumber: string | null;     // Required if fee > 0

  isPublic: boolean;              // Can be shared publicly
  status: 'draft' | 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

  createdBy: string;              // Admin UID
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Event Participants Collection

```typescript
interface EventParticipant {
  id: string;                     // Auto-generated
  eventId: string;                // Reference to event
  userId: string;                 // Reference to user

  // Denormalized user data for quick display
  userName: string;
  userEmail: string;
  userPhone: string;

  status: 'pending' | 'approved' | 'rejected';

  // Payment info (if event has fee)
  paymentRequired: boolean;
  bkashTransactionId: string | null;
  paymentVerified: boolean;
  paymentVerifiedAt: Timestamp | null;
  paymentVerifiedBy: string | null;

  // Timestamps
  joinedAt: Timestamp;
  approvedAt: Timestamp | null;
  approvedBy: string | null;

  // Notes
  adminNotes: string | null;
}
```

### Archived Events Collection

```typescript
interface ArchivedEvent {
  id: string;                     // Same as original event ID
  eventData: Event;               // Full event object snapshot

  participants: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    paymentVerified: boolean;
    bkashTransactionId: string | null;
  }>;

  totalParticipants: number;
  totalRevenue: number;

  exportedFileUrl: string | null; // CSV/Excel file URL
  archivedAt: Timestamp;
  archivedBy: string;             // Admin UID
}
```

---

## Authentication Flow

### Registration Flow

```
1. User visits /register
   ↓
2. Choose authentication method:
   ├── Google Sign-in → Auto-fill email, prompt for name & phone
   └── Email/Password → Fill: name, email, phone, password, confirm password
   ↓
3. Form validation (client-side)
   ↓
4. Create Firebase Auth user
   ↓
5. Create Firestore user document (status: 'pending')
   ↓
6. Send email verification link
   ↓
7. Redirect to /verify-email
   ↓
8. User clicks verification link in email
   ↓
9. Redirect to /pending-approval
   ↓
10. Admin reviews and approves user
    ↓
11. Send congratulations email to user
    ↓
12. User can now access the application
```

### Login Flow

```
1. User visits /login
   ↓
2. Enter credentials (Google or Email/Password)
   ↓
3. Firebase Authentication
   ↓
4. Check email verification status
   ├── Not verified → Redirect to /verify-email
   └── Verified → Continue
   ↓
5. Fetch user document from Firestore
   ↓
6. Check user status:
   ├── 'pending' → Redirect to /pending-approval
   ├── 'rejected' → Show rejection message
   └── 'approved' → Continue
   ↓
7. Update lastLoginAt
   ↓
8. Redirect based on role:
   ├── 'user' → /dashboard
   ├── 'admin' → /admin/dashboard
   └── 'super_admin' → /admin/dashboard
```

---

## Application Routes

### Public Routes (No Auth Required)

| Path | Page | Description |
|------|------|-------------|
| `/` | Landing | Public landing page with event listing |
| `/login` | Login | Login page |
| `/register` | Register | Registration page |
| `/verify-email` | VerifyEmail | Email verification instructions |
| `/pending-approval` | PendingApproval | Waiting for admin approval |
| `/forgot-password` | ForgotPassword | Password reset request |
| `/reset-password` | ResetPassword | Password reset form |
| `/event/:id/public` | PublicEvent | Public event view (shareable) |

### Protected User Routes (Approved Users)

| Path | Page | Description |
|------|------|-------------|
| `/dashboard` | Dashboard | User home dashboard |
| `/profile` | Profile | View own profile |
| `/profile/edit` | EditProfile | Edit profile form |
| `/directory` | Directory | Member directory |
| `/events` | Events | Events listing |
| `/event/:id` | EventDetails | Event details & join |
| `/my-events` | MyEvents | User's joined events |

### Admin Routes (Admin & Super Admin)

| Path | Page | Description |
|------|------|-------------|
| `/admin/dashboard` | AdminDashboard | Admin overview |
| `/admin/users` | UserApprovals | Pending user approvals |
| `/admin/users/all` | AllUsers | All users management |
| `/admin/events/create` | CreateEvent | Create new event |
| `/admin/events/:id/edit` | EditEvent | Edit event |
| `/admin/events` | ManageEvents | Manage all events |
| `/admin/events/:id/participants` | EventParticipants | Event participant approvals |

### Super Admin Routes

| Path | Page | Description |
|------|------|-------------|
| `/admin/manage-admins` | ManageAdmins | Add/remove admins |

---

## Component Architecture

### Design Principles

1. **Small, Reusable Components**: Each component should do one thing well
2. **Composition over Inheritance**: Build complex UIs by composing simple components
3. **Props for Configuration**: Use props to make components flexible
4. **Consistent API**: Similar components should have similar prop interfaces

### Component Prop Patterns

```jsx
// Button Component API
<Button
  variant="primary" | "secondary" | "outline" | "ghost" | "danger"
  size="sm" | "md" | "lg"
  isLoading={boolean}
  disabled={boolean}
  leftIcon={ReactNode}
  rightIcon={ReactNode}
  fullWidth={boolean}
  onClick={function}
>
  Button Text
</Button>

// Input Component API
<Input
  label="Email"
  type="text" | "email" | "password" | "tel"
  placeholder="Enter email"
  error="Error message"
  helperText="Helper text"
  leftIcon={ReactNode}
  rightIcon={ReactNode}
  disabled={boolean}
  required={boolean}
  {...register('fieldName')} // React Hook Form
/>

// Card Component API
<Card
  variant="glass" | "solid" | "outline"
  padding="sm" | "md" | "lg"
  hover={boolean}
>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>

// Modal Component API
<Modal
  isOpen={boolean}
  onClose={function}
  title="Modal Title"
  size="sm" | "md" | "lg" | "xl"
>
  <Modal.Body>Content</Modal.Body>
  <Modal.Footer>
    <Button onClick={onClose}>Cancel</Button>
    <Button variant="primary">Confirm</Button>
  </Modal.Footer>
</Modal>
```

---

## Feature Specifications

### 1. User Registration & Verification

**Registration Form Fields:**
- Name (required, min 2 chars)
- Email (required, valid email)
- Phone (required, valid phone format)
- Password (required, min 8 chars, 1 uppercase, 1 number)
- Confirm Password (must match)
- OR Google Sign-in

**Verification Flow:**
- Email verification link sent via Firebase
- Link expires after 24 hours
- Resend link option available
- After verification, status = 'pending'

### 2. Profile Management

**Profile Completion Calculation:**
```javascript
const calculateProfileCompletion = (user) => {
  const fields = [
    { key: 'photo', weight: 15 },
    { key: 'bloodGroup', weight: 10 },
    { key: 'profession.type', weight: 15 },
    { key: 'profession.details', weight: 10 }, // businessName OR designation+company
    { key: 'address.city', weight: 10 },
    { key: 'socialLinks', weight: 10 }, // At least one link
    { key: 'phone', weight: 15 },
    { key: 'name', weight: 15 },
  ];

  let completion = 0;
  // ... calculate based on filled fields
  return completion;
};
```

**Privacy Controls:**
- Name visibility toggle
- Email visibility toggle
- Phone visibility toggle (default: private)

### 3. Member Directory

**Table Columns:**
| Column | Sortable | Visible to |
|--------|----------|------------|
| Photo | No | All |
| Name | Yes | Based on privacy |
| Email | Yes | Based on privacy |
| Phone | Yes | Admin always, others based on privacy |
| Blood Group | Yes | All |
| Profession | Yes | All |

**Features:**
- Search by name, email, profession
- Sort by name, blood group, profession
- Pagination (20 per page)
- Member detail modal on click

### 4. Event Management

**Event Creation (Admin):**
- Banner image upload
- Title, description (rich text)
- Location
- Start/End date-time
- Participant limit (optional)
- Registration fee (0 for free)
- bKash number (if paid)
- Public/Private toggle

**Event Join Flow:**
```
1. User clicks "Join Event"
   ↓
2. Check if logged in
   ├── No → Redirect to /login with return URL
   └── Yes → Continue
   ↓
3. Check if approved user
   ├── No → Show message
   └── Yes → Continue
   ↓
4. Check if event is paid
   ├── Free → Create participant record (status: 'approved')
   └── Paid → Show payment modal
   ↓
5. (If paid) Enter bKash transaction ID
   ↓
6. Create participant record (status: 'pending')
   ↓
7. Admin verifies payment and approves
```

**Event Archival:**
- Automatic after event end date
- Export participants to CSV/Excel
- Store in archivedEvents collection
- Remove from active events

### 5. Admin Dashboard

**Stats Cards:**
- Total Members (approved)
- Pending Approvals
- Upcoming Events
- Active Events

**Quick Actions:**
- Review pending users
- Create new event
- View all members

---

## UI/UX Guidelines

### Glassmorphism Design System

**Core Tailwind Utilities:**
```css
/* Glass Card - Light Mode */
.glass-card {
  @apply bg-white/70 backdrop-blur-lg border border-white/20 shadow-xl;
}

/* Glass Card - Dark Mode */
.dark .glass-card {
  @apply bg-gray-900/70 backdrop-blur-lg border border-gray-700/50 shadow-xl;
}

/* Glass Input */
.glass-input {
  @apply bg-white/50 backdrop-blur-sm border border-gray-200/50
         focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20;
}

.dark .glass-input {
  @apply bg-gray-800/50 backdrop-blur-sm border border-gray-600/50
         focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20;
}

/* Glass Button */
.glass-button {
  @apply bg-white/20 backdrop-blur-sm border border-white/30
         hover:bg-white/30 transition-all duration-200;
}
```

### Color Palette

```css
/* Primary - Blue */
--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;

/* Accent - Violet */
--color-accent-500: #8b5cf6;
--color-accent-600: #7c3aed;

/* Success - Green */
--color-success-500: #22c55e;

/* Warning - Amber */
--color-warning-500: #f59e0b;

/* Error - Red */
--color-error-500: #ef4444;
```

### Typography Scale

```css
/* Headings */
h1: text-4xl font-bold (36px)
h2: text-3xl font-semibold (30px)
h3: text-2xl font-semibold (24px)
h4: text-xl font-medium (20px)
h5: text-lg font-medium (18px)
h6: text-base font-medium (16px)

/* Body */
body-lg: text-lg (18px)
body: text-base (16px)
body-sm: text-sm (14px)
caption: text-xs (12px)
```

### Spacing System

```
xs: 0.25rem (4px)
sm: 0.5rem (8px)
md: 1rem (16px)
lg: 1.5rem (24px)
xl: 2rem (32px)
2xl: 3rem (48px)
```

### Responsive Breakpoints

```
sm: 640px (Mobile landscape)
md: 768px (Tablet)
lg: 1024px (Desktop)
xl: 1280px (Large desktop)
2xl: 1536px (Extra large)
```

---

## Development Phases

### Phase 1: Foundation Setup
**Status:** Not Started

- [ ] Initialize project structure
- [ ] Configure Tailwind CSS with custom theme
- [ ] Setup Firebase project and config
- [ ] Create environment variables
- [ ] Implement theme system (dark/light mode)
- [ ] Build common UI components (Button, Input, Card, etc.)
- [ ] Setup React Router with route guards
- [ ] Create layout components

### Phase 2: Authentication System
**Status:** Not Started

- [ ] Firebase Auth initialization
- [ ] Google Sign-in integration
- [ ] Email/Password authentication
- [ ] Registration form with validation
- [ ] Email verification flow
- [ ] Pending approval page
- [ ] Login form
- [ ] Password reset flow
- [ ] Auth context and hooks
- [ ] Protected route components

### Phase 3: User Profile & Directory
**Status:** Not Started

- [ ] User profile page (view)
- [ ] Edit profile form
- [ ] Photo upload with Firebase Storage
- [ ] Profession conditional fields
- [ ] Social links management
- [ ] Privacy settings
- [ ] Profile completion calculator
- [ ] Member directory table
- [ ] Search and filter functionality
- [ ] Pagination
- [ ] Member detail modal

### Phase 4: Event System
**Status:** Not Started

- [ ] Event creation form (admin)
- [ ] Event listing page
- [ ] Event detail page
- [ ] Event banner upload
- [ ] Join event flow
- [ ] Payment modal (bKash)
- [ ] Participant management
- [ ] Event status management
- [ ] Event archival system
- [ ] CSV/Excel export

### Phase 5: Admin Panel
**Status:** Not Started

- [ ] Admin dashboard with stats
- [ ] User approval table
- [ ] Approve/Reject user actions
- [ ] Event participant approval
- [ ] Payment verification
- [ ] Admin management (super admin)
- [ ] All users table

### Phase 6: Polish & Deploy
**Status:** Not Started

- [ ] Email notifications (Cloud Functions)
- [ ] Loading states and skeletons
- [ ] Error handling and boundaries
- [ ] SEO meta tags
- [ ] Performance optimization
- [ ] Security rules testing
- [ ] Responsive design testing
- [ ] Firebase Hosting deployment

---

## Security Checklist

- [ ] Firebase Authentication enabled
- [ ] Email verification required before access
- [ ] Admin approval for new users
- [ ] Firestore security rules implemented
- [ ] Storage security rules implemented
- [ ] Phone number privacy controls
- [ ] Role-based access control
- [ ] Payment verification by admin
- [ ] Environment variables for sensitive data
- [ ] XSS protection (React default escaping)
- [ ] CORS configuration
- [ ] Rate limiting (Cloud Functions)

---

## SEO Configuration

### Meta Tags Template

```jsx
<Helmet>
  <title>{pageTitle} | AlumniCircle</title>
  <meta name="description" content={pageDescription} />

  {/* Open Graph */}
  <meta property="og:title" content={pageTitle} />
  <meta property="og:description" content={pageDescription} />
  <meta property="og:image" content="/og-image.png" />
  <meta property="og:type" content="website" />

  {/* Twitter */}
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={pageTitle} />
  <meta name="twitter:description" content={pageDescription} />

  {/* Canonical */}
  <link rel="canonical" href={canonicalUrl} />
</Helmet>
```

### Sitemap Pages

- Landing page
- Login
- Register
- Public events

---

## Development Progress

### Current Session (February 9, 2026)
- [x] Project plan created
- [x] Project structure implemented
- [x] Dependencies installed
- [x] Common UI components built (Button, Input, Card, Modal, etc.)
- [x] Layout components created (Navbar, Footer, MainLayout, AuthLayout, AdminLayout)
- [x] Authentication context and hooks
- [x] Theme context (dark/light mode)
- [x] Firebase configuration
- [x] Route guards (ProtectedRoute, PublicRoute)
- [x] Auth pages (Login, Register, VerifyEmail, PendingApproval, ForgotPassword)
- [x] Landing page
- [x] User Dashboard
- [x] Admin Dashboard
- [x] User service (CRUD operations)
- [x] Event service (CRUD operations)

### Completed Features
- Foundation setup with React 19 + Vite + Tailwind CSS 4
- Glassmorphism design system
- Dark/Light theme toggle
- Authentication system (Google + Email/Password)
- Email verification flow UI
- Admin approval workflow UI
- Basic routing structure

### In Progress
- Profile page components
- Directory components
- Event components
- Admin management components

### Next Steps
1. Create `.env.local` with Firebase credentials
2. Build Profile page and EditProfile page
3. Build Directory page with search, sort, pagination
4. Build Events page and EventDetails page
5. Build admin user approval page
6. Build event creation and management pages
7. Implement payment modal for paid events
8. Add email notifications (Firebase Cloud Functions)

### Blocked/Issues
_None yet_

---

## Quick Reference

### Firebase Collections
- `users` - User profiles
- `events` - Active events
- `eventParticipants` - Event registrations
- `archivedEvents` - Completed events

### User Roles
- `user` - Regular member
- `admin` - Can manage users & events
- `super_admin` - Full system control

### User Status
- `pending` - Awaiting approval
- `approved` - Full access
- `rejected` - Access denied

### Event Status
- `draft` - Not published
- `upcoming` - Published, not started
- `ongoing` - Currently happening
- `completed` - Finished
- `cancelled` - Cancelled

---

_Last Updated: February 9, 2026_
_Version: 1.0.0_
