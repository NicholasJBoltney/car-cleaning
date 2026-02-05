# Quick Start Guide: Testing New Features

This guide will walk you through testing all the newly implemented features.

---

## Prerequisites

Before testing, ensure you have:
1. ✅ Run `npm install` to get new dependencies (pdfkit, qrcode, twilio, axios)
2. ✅ Executed `lib/supabase/referral-schema.sql` in Supabase SQL Editor
3. ✅ Added API keys to `.env.local` (see below)

---

## Minimum Setup to Test

### Required (Core Features):
```env
# Supabase (already set up)
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key

# Paystack (already set up)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_key
```

### Optional (New Features):
```env
# For Photo Capture
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo  # Use "demo" for testing
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default  # Demo preset

# For SMS Notifications
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number

# For Weather Intelligence
WEATHER_API_KEY=your_key  # Get free from openweathermap.org
```

---

## Feature Testing Workflows

### 1. Photo Capture & PDF Reports

**Test Steps:**
1. Start dev server: `npm run dev`
2. Create a test booking (use Paystack test cards)
3. Go to `/admin` (Admin Panel)
4. Click "Start Job" on your test booking
5. Click "Capture Photos" button
6. Take/upload before photos (use your phone camera or select files)
7. Complete the service
8. Take/upload after photos
9. Fill in condition assessment:
   - Paint condition: Good/Excellent/Fair/Poor
   - Check boxes for swirl marks/scratches if applicable
   - Select treatments applied
   - Add technician notes
10. Click "Complete Service"

**Expected Results:**
- Photos upload to Cloudinary (check browser console for URLs)
- Service history record created in Supabase
- Booking marked as "completed"
- PDF generated (check console for PDF buffer)
- SMS sent to client (if Twilio configured)

**Cloudinary Test Mode:**
If you don't have Cloudinary yet, photos will fail to upload but the rest works. Get a free account at cloudinary.com to enable uploads.

---

### 2. Vehicle Health Decay Algorithm

**Test Steps:**
1. Go to `/portal` (Client Portal)
2. View your vehicles
3. Check the health score (0-100)
4. Look for the health bar (green/yellow/red)
5. Note "Last Service" date

**How It Works:**
- 0-5 days old: 80-100% (Excellent - Green)
- 6-12 days old: 60-79% (Good - Green/Yellow)
- 13-19 days old: 30-59% (Fair - Yellow)
- 20+ days old: 0-29% (Critical - Red)

**Test Decay:**
To see decay in action, you can temporarily modify the last service date in Supabase:
```sql
UPDATE bookings
SET updated_at = NOW() - INTERVAL '15 days'
WHERE id = 'your_booking_id';
```
Refresh portal to see health score drop.

---

### 3. Referral Program

**Test Steps:**

#### As Referrer:
1. Login to portal
2. Navigate to `/portal/referrals`
3. Copy your unique referral code (e.g., "JOHN8F3A2B")
4. Copy your referral link
5. Share via WhatsApp or Email buttons

#### As New User (Referred):
1. Open referral link in incognito/new browser
2. Complete booking process
3. Use referral code during checkout (feature needs to be added to checkout form)
4. Complete payment

#### After First Booking:
1. Both users should receive R200 credits
2. Check `/portal/referrals` to see credits balance
3. View referral stats (total, completed, pending)

**Database Check:**
```sql
-- View referral codes
SELECT * FROM referral_codes;

-- View credits
SELECT * FROM user_credits;

-- View referrals
SELECT * FROM referrals;

-- View transactions
SELECT * FROM credit_transactions ORDER BY created_at DESC;
```

---

### 4. Weather Intelligence

**Test Steps:**
1. Get free API key from openweathermap.org (takes 2 minutes)
2. Add to `.env.local`
3. Restart dev server

**Test Weather Check:**
```typescript
// In browser console or test file
import { getSaturdayWeather, checkWeatherForBooking } from '@/lib/weather';

// Check next Saturday
const weather = await getSaturdayWeather('Johannesburg');
console.log(weather);

// Check specific booking date
const check = await checkWeatherForBooking('2026-01-25', 'Johannesburg');
console.log(check.recommendation);
```

**Expected Output:**
```javascript
{
  date: '2026-01-25',
  temperature: 28,
  condition: 'Clear',
  precipitation_probability: 10,
  is_suitable_for_service: true,
  rain_alert: false
}
```

**Upsell Logic:**
- Rain >30%: Offer Rain Repel (R120)
- Temp >30°C: Offer UV Protection (R150)
- Wind >30km/h: Offer Dust Guard (R100)

---

### 5. SMS Notifications

**Test Steps:**
1. Sign up at twilio.com (free trial gives you credit)
2. Get a phone number (or use trial number)
3. Add credentials to `.env.local`
4. Restart server

**Manual Test:**
```typescript
import { sendSMS, NotificationTemplates } from '@/lib/notifications';

// Test booking confirmation
await sendSMS(
  '+27821234567',  // Your test number
  NotificationTemplates.bookingConfirmation('John', '2026-01-25', '09:00')
);
```

**Automated Triggers:**
- ✅ Booking confirmation: Sent after payment
- ⚠️ Pre-arrival: Needs cron job (24h before)
- ⚠️ En route: Manual trigger from admin
- ✅ Service complete: Sent when job marked complete
- ⚠️ Health reminder: Needs cron job (automated)

**Cron Jobs Setup:**
You'll need to set up scheduled functions for:
- Daily health checks: Run `processDailyHealthChecks()` every morning
- Pre-arrival reminders: Check bookings 24h ahead

---

## Testing Checklist

### Before Testing:
- [ ] `npm install` completed
- [ ] Database migrations run
- [ ] `.env.local` configured
- [ ] Dev server running

### Feature Tests:
- [ ] Photo upload works (before & after)
- [ ] PDF generation creates report
- [ ] Health scores display correctly
- [ ] Health bar shows proper color
- [ ] Referral codes generated
- [ ] Credits system works
- [ ] Weather API returns data
- [ ] SMS sends successfully (if Twilio configured)

### End-to-End Test:
- [ ] Complete booking as customer
- [ ] View in admin panel
- [ ] Start job
- [ ] Capture photos
- [ ] Complete service
- [ ] Verify SMS sent
- [ ] Check portal for updated health
- [ ] View referral dashboard
- [ ] Share referral code

---

## Troubleshooting

### Photos Not Uploading
**Error:** "Failed to upload to Cloudinary"
**Fix:**
1. Check `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` is set
2. Verify upload preset exists and is unsigned
3. Use "demo" cloud name for testing: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=demo`

### SMS Not Sending
**Error:** "Twilio not configured"
**Fix:**
1. Check all 3 Twilio env variables are set
2. Verify phone number has +27 prefix
3. Check Twilio console for delivery logs

### Health Score Always 50
**Fix:**
- Create a completed booking with payment_status = 'paid'
- Ensure booking has updated_at timestamp
- Vehicle must be linked to booking

### Referrals Not Working
**Fix:**
1. Run referral schema: `lib/supabase/referral-schema.sql`
2. Check user has profile: `SELECT * FROM user_profiles WHERE user_id = 'xxx'`
3. Verify trigger created referral code: `SELECT * FROM referral_codes WHERE user_id = 'xxx'`

### Weather API Not Working
**Error:** "Weather API key not configured"
**Fix:**
1. Sign up at openweathermap.org
2. Wait 10 minutes for API key activation
3. Add to `.env.local`
4. Restart server

---

## Quick Demo Script

**5-Minute Demo Flow:**

1. **Homepage** - Show luxury aesthetic
2. **Start Booking** - Add vehicle, pick Saturday slot
3. **Choose Service** - Show pricing tiers
4. **Complete Booking** - Use Paystack test card
5. **Portal View** - Show health score (fake old date to show decay)
6. **Referral Page** - Copy code, show sharing options
7. **Admin Panel** - View booking, start job
8. **Photo Capture** - Upload test photos
9. **Complete Service** - Show automated workflow
10. **SMS Notification** - Show message received (if Twilio works)

---

## Production Deployment Checklist

Before going live:
- [ ] Real Cloudinary account set up
- [ ] Real Twilio account with SA number
- [ ] Weather API key activated
- [ ] All database migrations run on production
- [ ] Environment variables in Vercel/hosting
- [ ] Test SMS to real SA numbers
- [ ] Verify photo uploads work
- [ ] Test PDF generation and download
- [ ] Confirm referral credits allocate
- [ ] Set up cron jobs for health reminders

---

## Performance Notes

- Photo uploads: ~2-5 seconds per image (depends on file size)
- PDF generation: <3 seconds
- SMS delivery: ~2-5 seconds
- Weather API: <500ms response
- Health calculation: Instant (client-side compatible)

---

## Support & Documentation

For detailed implementation docs, see:
- `docs/FEATURE-IMPLEMENTATION-SUMMARY.md` - Complete technical overview
- `Possible-features.md` - Feature status tracking
- `README.md` - Full setup guide

---

**Happy Testing! 🚀**
