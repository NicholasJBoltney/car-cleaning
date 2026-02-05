# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Bespoke Car Preservation Platform** - A premium vehicle preservation booking platform built with Next.js 15, Supabase, and Paystack for high-end South African estates.

### Core Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Payments**: Paystack
- **Additional Services**: Cloudinary (photos), Twilio (SMS), OpenWeatherMap (weather)

## Development Commands

### Core Commands
```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run Next.js linter
```

### Quick Testing
When testing features, use Paystack test cards (5200828282828210 / any future date / 123).

## Project Structure

### Top-Level Organization
```
app/              # Next.js App Router pages and routes
  ├── page.tsx           # Homepage (hero, features, CTA)
  ├── layout.tsx         # Root layout with navigation
  ├── book/              # Booking flow pages
  ├── portal/            # Client dashboard
  ├── admin/             # Admin/technician panel
  └── auth/              # Authentication routes
components/       # React components (shared, booking, admin, portal, nav)
lib/              # Utilities and integrations
  ├── supabase/          # Database client and schemas
  ├── *-algorithm.ts     # Business logic (health decay)
  ├── *-generator.ts     # PDF generation
  ├── notifications.ts   # SMS/notification handling
  ├── weather.ts         # Weather API integration
  ├── referrals.ts       # Referral system logic
  └── cloudinary.ts      # Photo upload integration
types/            # TypeScript interfaces (User, Vehicle, Booking, etc.)
public/           # Static assets
docs/             # Additional documentation
```

### Key Type System
All major entities are defined in `types/index.ts`:
- **User/UserProfile**: Auth and profile data
- **Vehicle**: Car details (brand, model, size_category, license_plate)
- **Booking**: Service request with pricing (base, addon, VAT, total)
- **Slot**: Saturday time slots (09:00, 11:00, 13:00)
- **ServiceHistory**: Photos, reports, and condition assessment
- **ServiceAddon**: Upsell services (Rain Repel, UV Protection)
- **Referral types**: Codes, credits, transactions

## Database Architecture

### Supabase Schema Organization
The schema is split into two files:
- `lib/supabase/schema.sql` - Core tables (users, vehicles, bookings, slots, service_history)
- `lib/supabase/referral-schema.sql` - Referral system tables

### Key Tables & Relationships
```
auth.users → user_profiles (1:1)
           → vehicles (1:N)
           → bookings (1:N)

bookings → vehicles (N:1)
        → slots (N:1)
        → service_history (1:1)

service_history → bookings (1:1)

referral_codes → user_profiles (N:1)
referral_credits → user_profiles (N:1)
```

### Important RLS Policies
Supabase Row-Level Security policies are in place:
- Users can only view/edit their own profiles, vehicles, and bookings
- Admin can access all bookings (read service_history)
- Referral data is user-scoped

## Feature Architecture

### Booking Flow (4 Steps)
1. **Step 1 (Vehicle)**: Brand, model, year, size_category
2. **Step 2 (Schedule)**: Saturday slot selection with real-time availability
3. **Step 3 (Service)**: Service type + optional add-ons
4. **Step 4 (Location)**: Address, suburb, city, postal_code, gate notes

**Components**: `components/booking/Step1Vehicle.tsx` through `Step4Location.tsx`
**Form State**: Managed in `/app/book/page.tsx`
**Checkout**: `/app/book/checkout/page.tsx` with Paystack inline payment

### Photo Capture System
**Location**: `/app/admin/job/[bookingId]/page.tsx`
- Mobile-optimized before/after photo interface
- Cloudinary CDN integration (uses unsigned upload with preset)
- Condition assessment form (paint quality, swirl marks, scratches)
- Treatment tracking checklist
- Automatic service_history record creation

### PDF Report Generation
**Location**: `/lib/pdf-generator.ts`
- Uses PDFKit for professional branded reports
- Includes vehicle info, service details, assessments
- Embeds QR codes linking to portal
- Color-coded paint condition status
- Called after service completion

### SMS Notifications
**Location**: `/lib/notifications.ts`
- Twilio integration for +27 (South African) numbers
- Templates: booking confirmation, 24h reminder, en-route alert, completion
- Used in booking success and service completion flows

### Weather Intelligence
**Location**: `/lib/weather.ts`
- OpenWeatherMap API integration
- Checks Saturday forecast for upsell opportunities
- Triggers automated addon suggestions:
  - Rain Repel (>30% rain): R120
  - UV Protection (>30°C): R150
  - Dust Guard (>30km/h wind): R100

### Vehicle Health Decay Algorithm
**Location**: `/lib/health-algorithm.ts` and `/lib/health-server.ts`
- Exponential decay model with 21-day protection cycle
- Real-time health scores (0-100)
- Status levels: Excellent, Good, Fair, Critical
- Triggers reminder window on days 18-22
- Portal displays vehicle health with color coding

### Referral Program
**Location**: `/app/portal/referrals/page.tsx` and `/lib/referrals.ts`
- Unique codes per user (format: "REFXXXXXX")
- R200 credit for both referrer and referred
- Auto-triggered on first booking
- Shareable links (WhatsApp, Email)
- Credit wallet with transaction history
- Ambassador tier infrastructure (ready to activate)

## Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=...
```

### Optional (Features)
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=...
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
WEATHER_API_KEY=...
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
```

## Styling & Theming

### Design System
- **Color Palette**:
  - Void Black (#07070A) - main background
  - Titanium Silver (#E6E8EE) - primary text
  - Electric Cyan (#40E0FF) - CTAs and active states
  - Slate Grey (#2B2F36) - cards/containers
- **Tailwind Config**: `tailwind.config.ts` (custom theme)
- **Fonts**: Inter, Montserrat, JetBrains Mono
- **Effects**: Glassmorphism, backdrop-blur, cyan glow on hover
- **Responsive**: Mobile-first approach

### Component Patterns
Shared components in `components/shared/`: Button, Card, Input, Modal, Badge
These follow the luxury dark mode aesthetic and are used throughout the app.

## Common Development Patterns

### Supabase Queries
```typescript
import { supabase } from '@/lib/supabase/client';

const { data, error } = await supabase
  .from('table_name')
  .select('*')
  .eq('user_id', userId);
```

### Type Safety
Always use types from `types/index.ts` for database entities. Match field names exactly to schema.

### Payment Integration
Paystack checkout is handled in `/app/book/checkout/page.tsx`:
- Uses inline popup (not redirect)
- Verifies reference after success
- Creates booking/vehicle records on successful payment
- Sends notifications

### Service History Creation
When a service completes, follow this pattern:
1. Collect photos (via Cloudinary) and assessment data
2. Create service_history record with before/after photos
3. Generate PDF report
4. Update booking status to "completed"
5. Send completion SMS
6. Return health score to portal

## Testing & Verification

### Running Features
1. Dev server: `npm run dev`
2. Create test booking with Paystack test card
3. Access admin at `/admin` for job management
4. Access portal at `/portal` for client view
5. Check console for API responses and errors

### Checking Email/SMS
- SMS requires Twilio config in .env.local
- Emails require Resend config
- Logs are printed to server console during dev

## Database Maintenance

### Adding Schema Changes
1. Update SQL in `lib/supabase/schema.sql` or `lib/supabase/referral-schema.sql`
2. Run in Supabase SQL Editor
3. Update TypeScript types in `types/index.ts`
4. Update RLS policies if needed

### Seeding Data
Slots are pre-seeded with 8 weeks of Saturday slots. Custom seeding can be done via:
- Supabase dashboard SQL Editor
- Next.js API route (create `/app/api/seed/route.ts`)

## Performance Considerations

### Image Optimization
- Cloudinary handles image CDN and optimization
- Next.js Image component configured for res.cloudinary.com
- Before/after photos are stored as URLs, not blobs

### Database Queries
- Use `.select()` to limit columns when possible
- Slot queries can be heavy (8 weeks × 3 slots) - consider caching
- RLS policies are automatically applied - no additional auth checks needed

### Client Components
- Use `'use client'` for interactive features (photo capture, forms)
- Server components for data fetching where possible
- Avoid re-rendering entire booking flow on step changes

## Common Issues & Solutions

### Supabase Auth Issues
- Magic link not arriving: Check SITE_URL and REDIRECT_URLs in Supabase Auth settings
- auth.users row missing: User profile creation happens in booking success, ensure payment completes

### Photo Upload Failures
- Check Cloudinary cloud name and upload preset in env
- Use "demo" cloud name for testing (limited to small files)
- Unsigned uploads require preset configuration in Cloudinary

### Slot Availability Issues
- Pre-seeded slots are 8 weeks out
- Check if current_bookings >= max_capacity (default 2 per slot)
- Slots marked is_booked=true when full (via database trigger)

### Paystack Integration
- Test mode uses specific test cards (5200828282828210)
- Public key must be test key in development
- Verify reference for actual payment confirmation (optional, can trust webhook)

## Documentation References

See the `docs/` folder for additional information:
- `POC-Planner.md` - High-level feature planning and technical decisions
- `FEATURE-IMPLEMENTATION-SUMMARY.md` - Details on all 6 new features
- `QUICK-START-NEW-FEATURES.md` - Testing guide for new features
