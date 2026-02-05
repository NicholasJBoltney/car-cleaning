# Bespoke Car Preservation Platform

A premium, tech-enabled vehicle preservation booking platform designed for high-end South African estates. Built with Next.js 15, Supabase, and Paystack.

## Features

### Core Platform
- **Homepage**: Luxury landing page with glassmorphism navigation, paint damage comparison, and estate-friendly metrics
- **Booking Engine**: 4-step booking flow (Vehicle → Schedule → Service → Location)
- **Paystack Integration**: Secure inline payment processing
- **Client Portal**: "Heritage Vault" for viewing vehicles and service history
- **Admin Panel**: Technician terminal for managing Saturday run sheets
- **Magic Link Authentication**: Passwordless login via Supabase
- **Full User Profiles**: Includes first name, last name, phone, email, and address

### 🎉 New: Digital Moat Features (2026-01-16)
- **📷 Photo Capture System**: Mobile-optimized before/after photo interface with Cloudinary CDN integration
- **📄 PDF Report Generation**: Automated professional service reports with QR codes and branding
- **📱 SMS Notifications**: Twilio integration with pre-built templates (booking confirmations, reminders, completion alerts)
- **🌦️ Weather Intelligence**: OpenWeather API integration with automated upsell recommendations (Rain Repel, UV Protection)
- **🎁 Referral Program**: Complete credit system with unique codes, auto-rewards, and viral sharing
- **💚 Vehicle Health Decay Algorithm**: 21-day protection tracking with automated rebooking reminders

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth, Database, Storage)
- **Payments**: Paystack
- **Styling**: Custom luxury dark mode theme with electric cyan accents

## Project Structure

```
├── app/
│   ├── page.tsx                    # Homepage
│   ├── layout.tsx                  # Root layout with navigation
│   ├── book/
│   │   ├── page.tsx                # Booking engine
│   │   ├── checkout/page.tsx       # Paystack checkout
│   │   └── success/page.tsx        # Booking confirmation
│   ├── portal/
│   │   └── page.tsx                # Client dashboard
│   ├── admin/
│   │   └── page.tsx                # Technician terminal
│   └── auth/
│       ├── login/page.tsx          # Magic link login
│       └── callback/page.tsx       # Auth callback handler
├── components/
│   ├── shared/                     # Reusable UI components
│   ├── nav/                        # Navigation components
│   ├── booking/                    # Booking flow components
│   ├── portal/                     # Client portal components
│   └── admin/                      # Admin panel components
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Supabase client
│   │   └── schema.sql              # Database schema
│   └── paystack.ts                 # Paystack integration
└── types/
    └── index.ts                    # TypeScript interfaces
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

Required environment variables:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Paystack
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Optional: Google Maps, Cloudinary, Resend, Twilio
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor
3. Run the schema from `lib/supabase/schema.sql`
4. Run the referral schema from `lib/supabase/referral-schema.sql` (for referral program)

This will create:
- User profiles table (with first_name, last_name, phone, email)
- Vehicles table
- Bookings table
- Slots table (with 8 weeks of Saturday slots pre-seeded)
- Service addons table (with default add-ons)
- Service history table (for photos and reports)
- Referral system tables (codes, credits, transactions, ambassadors)
- Row-Level Security policies
- Automatic triggers for slot management and referral credits

### 4. Configure Supabase Auth

1. Go to Authentication → Settings in your Supabase dashboard
2. Enable **Email** provider
3. Configure the email templates for Magic Link
4. Set the **Site URL** to `http://localhost:3000` (development) or your production domain
5. Add `http://localhost:3000/**` to **Redirect URLs**

### 5. Set Up Paystack

1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your **Public Key** from Settings → API Keys & Webhooks
3. Add it to your `.env.local`

### 6. Set Up Additional Services (Optional but Recommended)

#### Cloudinary (Photo Storage)
1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Get your Cloud Name from the dashboard
3. Create an unsigned upload preset: Settings → Upload → Add upload preset
4. Add to `.env.local`:
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_preset_name
```

#### Twilio (SMS Notifications)
1. Sign up at [twilio.com](https://twilio.com)
2. Purchase a South African phone number (+27)
3. Get Account SID and Auth Token from console
4. Add to `.env.local`:
```env
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
```

#### OpenWeatherMap (Weather Intelligence)
1. Sign up at [openweathermap.org](https://openweathermap.org)
2. Get free API key (1000 calls/day)
3. Add to `.env.local`:
```env
WEATHER_API_KEY=your_api_key
```

#### Resend (Email - Optional)
1. Sign up at [resend.com](https://resend.com)
2. Get API key
3. Add to `.env.local`:
```env
RESEND_API_KEY=your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 7. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Database Schema Highlights

### User Profiles
- Stores first_name, last_name, phone, email, address
- Linked to Supabase auth.users via user_id

### Vehicles
- Brand, model, year, size_category (sedan/suv/luxury/sports)
- License plate and optional VIN
- Linked to users with RLS

### Bookings
- Links user, vehicle, and slot
- Stores service details and pricing
- Payment status and reference
- Complete address information

### Slots
- Saturday-only time slots
- Auto-managed capacity via triggers
- Pre-seeded with 8 weeks of availability

### Service History
- Before/after photos (Cloudinary URLs)
- Technician notes and condition reports
- PDF report URLs

## Key Pages

### Homepage (`/`)
- Hero section with call-to-action
- Paint damage comparison
- Estate-friendly metrics (0dB noise, 90% water savings)
- Science section explaining polymer technology

### Booking Engine (`/book`)
- **Step 1**: Vehicle details (brand, model, category)
- **Step 2**: Saturday scheduler (real-time availability)
- **Step 3**: Service selection with add-ons
- **Step 4**: Location and contact details (name, surname, phone, email)

### Checkout (`/book/checkout`)
- Paystack inline payment popup
- Order summary with VAT calculation
- Secure payment processing

### Client Portal (`/portal`)
- View all vehicles with health scores
- Recent booking history
- One-tap rebooking

### Admin Panel (`/admin`)
- Saturday run sheet
- Job management (start, in-progress, complete)
- Client contact information
- Gate access notes

## Styling

The platform uses a luxury dark mode aesthetic:

### Color Palette
- **Void Black** (#07070A): Main background
- **Titanium Silver** (#E6E8EE): Primary text
- **Electric Cyan** (#40E0FF): CTAs and active states
- **Slate Grey** (#2B2F36): Cards and containers

### Typography
- **Headlines**: Inter (bold/semi-bold)
- **Body**: Inter/Montserrat
- **Technical**: JetBrains Mono

### Design Elements
- Glassmorphism navigation with backdrop-blur
- Hover effects with cyan glow
- Smooth animations and transitions
- Mobile-first responsive design

## Payment Flow

1. User completes 4-step booking form
2. Reviews order summary
3. Proceeds to checkout
4. Paystack popup opens for payment
5. On success:
   - User profile created/updated (with name, surname, phone)
   - Vehicle record created
   - Booking confirmed with payment reference
   - Slot marked as booked
   - Redirect to success page
6. Confirmation email sent (requires Resend integration)

## Authentication

- Magic link authentication via Supabase
- Passwordless login
- Secure email-based access
- Auto-redirect to portal after login

## New Feature Implementations

### 📷 Photo Capture System
- **Location**: `/app/admin/job/[bookingId]/page.tsx`
- Mobile-optimized interface for before/after photos
- Cloudinary CDN integration with automatic uploads
- Multiple photo support with preview and removal
- Condition assessment form (paint quality, swirl marks, scratches)
- Treatment tracking checklist
- Technician notes field

### 📄 PDF Report Generation
- **Location**: `/lib/pdf-generator.ts`
- Professional branded service reports using PDFKit
- Includes vehicle info, service details, treatments, and assessments
- QR code linking to digital portal
- Color-coded paint condition status
- Photo documentation summary
- Next service recommendations

### 📱 SMS Notification System
- **Location**: `/lib/notifications.ts`
- Twilio integration for South African numbers (+27)
- Pre-built templates:
  - Booking confirmation
  - 24h pre-arrival reminder
  - Technician en route alert
  - Service completion notification
  - Vehicle health reminders
  - Weather alerts with upsells

### 🌦️ Weather Intelligence
- **Location**: `/lib/weather.ts`
- OpenWeatherMap API integration
- 7-day forecast tracking
- Saturday-specific weather checking
- Automated upsell recommendations:
  - Rain Repel (>30% rain probability): R120
  - UV Protection (>30°C): R150
  - Dust Guard (>30km/h wind): R100
- Proactive rescheduling suggestions

### 🎁 Referral Program
- **Location**: `/app/portal/referrals/page.tsx` + `/lib/referrals.ts`
- Unique referral codes per user
- R200 credit for both referrer and referred
- Automated credit allocation on first booking
- Shareable links (WhatsApp, Email)
- Credit wallet system with transaction history
- Ambassador program infrastructure (ready to activate)

### 💚 Vehicle Health Decay Algorithm
- **Location**: `/lib/health-algorithm.ts`
- Exponential decay model with 21-day protection cycle
- Real-time health scores (0-100)
- Status levels: Excellent, Good, Fair, Critical
- Automated reminder window (days 18-22)
- SMS notifications when protection drops
- Admin dashboard for follow-up opportunities

## Future Enhancements

- [ ] WhatsApp Business API integration
- [ ] Google Maps autocomplete for addresses
- [ ] Advanced route optimization
- [ ] Admin role-based access control
- [ ] Email notification activation (templates ready, needs Resend API key)
- [ ] Ambassador tier progression UI
- [ ] AI-powered damage detection
- [ ] Resale value integration with AutoTrader

## Development Notes

### Running the Project

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Database Migrations

After making schema changes:
1. Update `lib/supabase/schema.sql`
2. Run the migration in Supabase SQL Editor
3. Update TypeScript types in `types/index.ts`

### Adding New Features

1. Create component in appropriate folder
2. Add route in `app/` directory
3. Update types in `types/index.ts`
4. Follow existing styling patterns

## Support

For questions or issues, refer to the comprehensive POC planner in `docs/POC-Planner.md`

## License

Private - All Rights Reserved

---

**Built with precision for premium vehicle preservation.**
