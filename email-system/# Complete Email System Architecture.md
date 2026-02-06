# Complete Email System Architecture
## Luxury Rinsless Car Detailing Business (Saturday-Only Service)

**Business Model:** 4 Saturday slots per week | 16 bookings per month maximum  
**Email Platform:** Resend (Free Tier: 3,000 emails/month)  
**Expected Usage:** 150-250 emails/month (5-8% of free tier)

---

## TABLE OF CONTENTS

1. [Database Structure & Customer Tracking](#part-1)
2. [Email Flow Architecture - All 7 Flows](#part-2)
3. [Email Deliverability Best Practices](#part-3)
   - [Sender Reputation](#sender-reputation)
   - [Content Best Practices](#content-best-practices)
   - [Email Opt-In Implementation](#opt-in-implementation) ⭐ NEW
   - [List Hygiene](#list-hygiene)
4. [Automation Workflow Logic](#part-4)
5. [Tracking & Analytics Dashboard](#part-5)
6. [Sample Email Calendar](#part-6)
7. [Implementation Roadmap](#part-7)
8. [Email Template Examples](#part-8)
9. [Resend Setup Guide](#part-9)
10. [Maintenance & Optimization](#part-10)

---

## PART 1: DATABASE STRUCTURE & CUSTOMER TRACKING {#part-1}

Every customer in your system should have these data fields tracked:

**CORE IDENTITY:**
- Customer ID (unique identifier)
- First Name
- Last Name
- Email Address
- Phone Number
- Home Address (where you provide service)
- HOA Community Name

**VEHICLE INFORMATION:**
- Vehicle Make (Tesla, BMW, Mercedes, etc.)
- Vehicle Model (Model 3, M5, etc.)
- Vehicle Year
- Vehicle Color
- License Plate (optional - helps identify on arrival)
- Special Notes (ceramic coating, PPF, custom paint warnings)

**BOOKING HISTORY:**
- First Booking Date
- Last Booking Date
- Total Bookings (lifetime count)
- Booking Frequency (monthly, bi-monthly, quarterly, one-time)
- Average Days Between Bookings
- Total Revenue (lifetime value)
- Preferred Time Slot (morning/afternoon preference)

**ENGAGEMENT DATA:**
- Email Open Rate (%)
- Email Click Rate (%)
- Last Email Opened Date
- Marketing Consent (Yes/No)
- Referral Source (Facebook ad, Google, referral, etc.)
- Referrals Made (how many people they've referred)
- Referral Credits Available ($)

**CUSTOMER STATUS:**
- Active (booked within last 90 days)
- Lapsed (90-180 days since last booking)
- Inactive (180+ days, no upcoming booking)
- VIP (5+ bookings OR monthly subscriber)
- First-time customer
- Churned (requested removal from list)

**COMMUNICATION PREFERENCES:**
- Email Opt-in (Yes/No) - **REQUIRED before sending**
- Email Frequency Preference
- SMS Opt-in (Yes/No)
- Marketing Emails Consent (Yes/No)
- Review Request Sent (Yes/No)
- Review Submitted (Yes/No)

---

## PART 2: EMAIL FLOW ARCHITECTURE - ALL 7 FLOWS {#part-2}

### FLOW 1: New Customer Onboarding (6 Emails)

**DAY 0 - IMMEDIATE: Booking Confirmation**
- Subject: "Your Saturday Detail is Confirmed - [Date]"
- Content: Welcome, booking details, what to expect, prep checklist, add to calendar
- CTA: "Add to Calendar"

**DAY -2: Service Reminder**
- Subject: "Saturday Detail Reminder: We're Coming in 2 Days"
- Content: Friendly reminder, prep checklist, weather check, reschedule option
- CTA: "Need to Reschedule?"

**DAY -1: Tomorrow Reminder** (Consider SMS instead)
- Subject: "See You Tomorrow - Final Prep"
- Content: Brief reminder, arrival window, text notification promise
- Keep SHORT (3-4 sentences)

**DAY 0 - AFTER SERVICE: Thank You + Summary**
- Subject: "Your [Vehicle] is Showroom Ready"
- Content: Thank you, service summary, maintenance tips, receipt, before/after photos
- NO review request yet (too soon)

**DAY +7: Review Request**
- Subject: "How Did We Do? 2-Minute Feedback"
- Content: Hope enjoying clean car, importance of feedback, direct Google review link
- CTA: "Leave a Google Review" (primary), "Send Private Feedback" (secondary)
- ONLY send if no review already submitted

**DAY +21-30: Re-Booking Invitation**
- Subject: "Time for Another Detail? Book Your Next Saturday"
- Content: 3 weeks elapsed, benefits of regular maintenance, limited availability
- CTA: "Book My Next Detail"
- ONLY send if no upcoming booking exists

---

### FLOW 2: Repeat Customer (4 Emails - Simplified)

**DAY 0: Simple Confirmation**
- Subject: "You're Booked - [Date]"
- Content: "Welcome back!", date/time/location, add to calendar
- Shorter than new customer version

**DAY -2: Quick Reminder**
- Subject: "This Saturday - [Time]"
- Content: Brief reminder, prep checklist link, reschedule option

**DAY 0 - AFTER SERVICE: Thank You**
- Subject: "Thanks Again - See You Soon?"
- Content: Thank you, summary, receipt, soft CTA for next booking

**DAY +30: Re-Booking Prompt**
- Subject: "Ready for Your Monthly Detail?"
- Content: One month elapsed, keep the shine, easy rebooking
- CTA: "Reserve My Spot"
- ONLY if no upcoming booking

---

### FLOW 3: VIP/Monthly Subscriber (Minimal Emails)

**MONTHLY RECURRING:**
- Email 1: Reminder (2 days before) - "Your Monthly Detail is This Saturday"
- Email 2: Thank You + Receipt (after service)
- NO re-booking emails (already scheduled)
- NO monthly review requests (only every 6 months)

**QUARTERLY VIP CHECK-IN:**
- Subject: "Thank You for Being a Valued Client"
- Content: Personal thank you, duration as client, exclusive VIP offer, referral reminder, feedback request
- Sent every 3 months

**Annual Email Count for VIP:** ~28 emails/year (vs 48+ for one-timers)

---

### FLOW 4: Referral Program

**WHEN REFERRAL BOOKS - TO REFERRER:**
- Subject: "Thanks for the Referral! $20 Credit Added"
- Content: Thank them, credit added notification, earn more invitation, share link
- CTA: "Refer Another Friend"

**WHEN REFERRAL BOOKS - TO NEW CUSTOMER:**
- Subject: "Welcome! [Referrer] Recommended Us + $10 Off"
- Content: Personal intro via referrer, discount applied, booking details
- Then continues into new customer onboarding flow

**ONGOING REFERRAL REMINDERS:**
- Sent to: Active customers who haven't referred anyone
- Frequency: Once every 3 months
- Subject: "Know Someone with a Dirty [Tesla/BMW]?"
- Content: Share the love, you get $20/they get $10, easy share options
- CTA: "Get My Referral Link"
- Tone: Light, not pushy

---

### FLOW 5: Lapsed Customer Re-Engagement (3 Emails over 6 Months)

**DAY 90 (3 months): Friendly Check-In**
- Subject: "We Miss Your [Vehicle]!"
- Content: It's been a while, hope all is well, we'd love to help again
- NO discount (test if they return without incentive)
- CTA: "Book My Detail"

**DAY 120 (4 months): Win-Back Offer**
- Subject: "Come Back - 15% Off Your Next Detail"
- Content: Earn business back, 15% off welcome back offer, expires in 30 days
- CTA: "Claim My 15% Off"

**DAY 180 (6 months): Final Attempt**
- Subject: "Before You Go... Can We Improve?"
- Content: Haven't seen you, request feedback, 20% off if returning, graceful unsubscribe option
- CTA: "Give Feedback" (primary), "Book with 20% Off" (secondary)
- After this: Move to "Inactive" status (seasonal emails only)

---

### FLOW 6: Seasonal Campaigns (4 Per Year)

**SPRING (March):**
- Subject: "Spring Clean Your [Vehicle] - Book Now"
- Audience: ALL customers (Active + Lapsed + Inactive)
- Content: Remove winter grime, prepare for driving season, limited slots
- Optional: Early bird discount

**SUMMER (June):**
- Subject: "Protect Your Paint This Summer"
- Audience: Active + Recently Lapsed only
- Content: UV damage risks, regular maintenance importance, pre-vacation booking

**FALL (September):**
- Subject: "Prep Your Car for Fall/Winter"
- Audience: Active + Lapsed
- Content: Leaves/sap/pollen, protect before harsh weather, holiday rush warning

**WINTER (December):**
- Subject: "Give the Gift of a Clean Car"
- Audience: Active customers only
- Primary: Gift certificates available, perfect for car lovers, digital delivery
- Secondary: "Or treat yourself before New Year's"

**Sending Strategy:**
- Active: All 4 campaigns
- Lapsed (90-180 days): 2-3 campaigns (Spring, Fall, +1)
- Inactive (180+): Spring only
- VIP Monthly: SKIP all (already engaged)

---

### FLOW 7: Monthly Newsletter (OPTIONAL)

**Frequency:** Once per month  
**Audience:** Opted-in customers who opened last 3 newsletters  
**Skip if:** Customer has booking in next 14 days OR booked in last 30 days

**Template Structure:**
1. Educational Tip (300 words): How to remove tree sap, caring for ceramic coating, etc.
2. Behind the Scenes: Recent transformation photo, customer highlight
3. Availability Update: "Next month: 3 slots remaining" + soft booking CTA
4. Customer Spotlight (optional): Feature happy customer with permission

**Who Gets It:**
- ✅ Active customers (no booking in 60+ days)
- ✅ Past customers who opted in
- ❌ VIP monthly subscribers
- ❌ Customers with upcoming bookings
- ❌ Recent bookers (last 30 days)
- ❌ Non-openers (last 3 newsletters)

---

## PART 3: EMAIL DELIVERABILITY BEST PRACTICES {#part-3}

### Critical Technical Setup (NON-NEGOTIABLE)

**DNS Records You MUST Add:**

1. **SPF Record:**
   - Type: TXT
   - Name: @ or yourdomain.com
   - Value: v=spf1 include:_spf.resend.com ~all

2. **DKIM Record:**
   - Type: TXT
   - Name: resend._domainkey
   - Value: [Provided by Resend]

3. **DMARC Record:**
   - Type: TXT
   - Name: _dmarc
   - Value: v=DMARC1; p=none; rua=mailto:your@email.com

4. **Custom Domain:**
   - ✅ Send from: your@yourdomain.com
   - ❌ NEVER from: your@gmail.com or noreply@

**Without these: Your emails WILL go to spam.**

---

### Sender Reputation Do's and Don'ts

**DO:**
- Use consistent "From" name: "John at Prestige Detail <john@company.com>"
- Warm up domain (start small, increase gradually)
- Monitor bounce rates (keep under 2%)
- Track spam complaints (keep under 0.1%)
- Maintain engagement (25%+ opens for transactional, 20%+ for marketing)

**DON'T:**
- Change sender email frequently
- Use "noreply@" addresses
- Send from free providers (Gmail, Yahoo)
- Buy email lists
- Email people who didn't opt in

---

### Content Best Practices

**AVOID These Spam Trigger Words:**
- ❌ "FREE" (especially ALL CAPS)
- ❌ "Click here NOW!!!"
- ❌ "Act now"
- ❌ "Limited time only" (sparingly)
- ❌ "$$$" or "100% free"
- ❌ Excessive exclamation marks!!!

**USE Instead:**
- ✅ "Complimentary" not "FREE"
- ✅ "Available Saturday" not "LIMITED TIME"
- ✅ "Book your spot" not "CLICK NOW"
- ✅ Natural, conversational language

---

### Optimal Email Structure

**Subject Line:**
- Clear and specific
- Under 50 characters
- Personalized: "Hi Michael, ready for another detail?"
- No excessive punctuation

**Body:**
- Text-to-image ratio: 60/40 or higher
- Proper paragraph breaks
- One clear CTA button
- Alt text on all images
- Real unsubscribe link

**Footer (Required by Law):**
- Company name
- Physical address
- Working unsubscribe link
- Preference center (optional)

---

### Engagement Signals

**GOOD (Boosts Deliverability):**
- ✅ High open rates (25%+)
- ✅ Click-throughs (10%+)
- ✅ Replies to emails
- ✅ Moving email out of spam
- ✅ Adding sender to contacts

**BAD (Hurts Deliverability):**
- ❌ Low opens (<10%)
- ❌ No clicks
- ❌ Spam reports
- ❌ Immediate deletes
- ❌ Never opening

**Action:** Segment by engagement. Only market to engaged subscribers.

---

### Email Opt-In Implementation (Compliance & Best Practice)

**WHY OPT-IN IS REQUIRED:**
- ✅ Legal requirement (GDPR, CAN-SPAM, etc.)
- ✅ Better deliverability (opt-in lists have 95%+ inbox rates)
- ✅ Higher engagement (only interested subscribers)
- ✅ Lower unsubscribe rates
- ✅ Protects sender reputation

**❌ DO NOT:** Use opt-out (send by default, let them unsubscribe). This violates compliance and harms deliverability.

---

#### Implementation Option 1: Sign-Up/Magic Link (Recommended)

**Add checkbox to authentication/registration flow:**

```
☐ Send me booking confirmations, reminders, and service updates
```

**Key points:**
- Checkbox starts **UNCHECKED** (explicit opt-in required)
- Specific language about what emails they'll receive
- Not required to complete registration (optional field)
- Store preference in database as `email_opt_in` (boolean, default FALSE)

**Database addition:**
```sql
ALTER TABLE user_profiles ADD COLUMN email_opt_in BOOLEAN DEFAULT FALSE;
```

**Example phrasing options:**
- "✓ Send me booking confirmations, reminders, and offers"
- "✓ I'd like to receive updates about my bookings and special services"
- "✓ Email me confirmations, preparation tips, and promotions"

---

#### Implementation Option 2: During First Booking

**Add opt-in prompt at checkout (before payment):**

```
☐ Yes, send me reminders and special offers

(Only checked if customer explicitly clicks during signup + booking)
```

**Advantage:** Captures consent when motivation is highest (just booked)
**Disadvantage:** Some may skip if not required

---

#### Implementation Option 3: Welcome Email Post-Signup

**Send transactional welcome email with preference center:**

```
Subject: Welcome to Prestige Detail - Manage Your Preferences

Hi Michael,

Thanks for signing up! Before your first booking,
let us know how you'd like to hear from us:

[Manage My Email Preferences Button]

By default, we'll only send:
✓ Booking confirmations & reminders
✓ Important service updates
✓ Receipt & service reports

You can opt-in to special offers and promotions
in your preference center anytime.
```

---

#### Checking Opt-In Before Sending

**Required code pattern** (any language):

```typescript
// Before sending ANY marketing email
const { data: user } = await supabase
  .from('user_profiles')
  .select('email_opt_in, email')
  .eq('id', userId)
  .single();

// Only send if opted in
if (user?.email_opt_in) {
  await sendMarketingEmail(user.email);
} else {
  console.log(`Skipped email to ${user.email} - not opted in`);
}
```

**Note:** Transactional emails (booking confirmations, reminders, service updates) may be sent without opt-in if they're tied to an active booking. However, promotional emails (re-booking invitations, seasonal campaigns) require explicit opt-in.

---

#### Unsubscribe Link (Required in Every Email)

**Every email footer must include:**

```html
<p style="font-size: 12px; color: #999;">
  [Manage Email Preferences] | [Unsubscribe]
</p>
```

**When clicked, unsubscribe should:**
1. Update `email_opt_in = FALSE` in database
2. Show confirmation: "You've been unsubscribed"
3. Offer to update preferences instead of full unsubscribe

---

#### Compliance Checklist

Before sending ANY marketing emails, verify:

- ☐ Customer has `email_opt_in = TRUE` in database
- ☐ Confirmation captured (checkbox, email preference, etc.)
- ☐ Opt-in timestamp recorded
- ☐ Every email includes unsubscribe link
- ☐ Unsubscribe link immediately updates database
- ☐ Custom domain used (not noreply@, Gmail, Yahoo)
- ☐ SPF/DKIM/DMARC configured
- ☐ Privacy policy links in footer
- ☐ Company name and address in footer

---

#### Best Practice Flow

```
WEEK 0: Customer Signs Up (via Magic Link)
├─ Show email opt-in checkbox (unchecked) ← CAPTURE HERE
├─ Customer checks it (or doesn't)
├─ Store choice in database
└─ Send transactional welcome email (no opt-in needed)

WEEK 0: Customer Makes Booking
├─ Check email_opt_in in database
├─ If TRUE → Send booking confirmation + reminders
└─ If FALSE → Only send mandatory booking confirmation

WEEK 1+: Marketing Emails
├─ Every marketing email checks email_opt_in
├─ Re-booking invitations → Only if opted in
├─ Seasonal campaigns → Only if opted in
├─ Referral emails → Only if opted in
└─ Always include unsubscribe link

ANYTIME: Customer Clicks Unsubscribe
├─ Set email_opt_in = FALSE
├─ Show confirmation
├─ Never email again (except transactional)
└─ Don't ask why (optional, not required)
```

---

#### Where to Add Email Opt-In in Your Platform

**NOTE:** Users must sign in first to make bookings, so opt-in capture happens at sign-up.

| Location | Purpose | File/Component | When |
|----------|---------|---|---|
| **Magic Link Sign-Up** | PRIMARY opt-in capture | `/app/auth/` components | When user creates account |
| **Portal Settings** | Update preferences | `/app/portal/` (add settings page) | Anytime user wants to change |
| **Welcome Email Link** | Optional confirmation | Resend email template | Day 0, after sign-up |

---

#### Recommended Implementation (Pick 1-2)

**OPTION A (Simple):** Sign-Up Only
- Add checkbox to `/app/auth/` sign-up form
- ☐ Email me booking confirmations, reminders, and special offers
- Single moment, cleanest UX
- ✅ Easiest, captures 100% of users

**OPTION B (Recommended):** Sign-Up + Portal Settings
- Add checkbox to `/app/auth/` sign-up
- Add settings page at `/app/portal/settings/` (or `/app/portal/preferences/`)
- Users can change preference anytime after signup
- ✅ Best balance (simple + flexible)

**OPTION C (Premium):** All Three
- Sign-up checkbox
- Portal settings page
- Email preference center link
- ✅ Maximum flexibility (most compliant)

---

#### Database Migration Checklist

Before implementing, run these in Supabase SQL Editor:

```sql
-- Add opt-in column to user_profiles
ALTER TABLE user_profiles ADD COLUMN email_opt_in BOOLEAN DEFAULT FALSE;

-- Add timestamp to track when they opted in
ALTER TABLE user_profiles ADD COLUMN email_opt_in_date TIMESTAMP DEFAULT NULL;

-- Optional: Create audit table to log opt-in changes
CREATE TABLE email_opt_in_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  opted_in BOOLEAN,
  source TEXT, -- 'signup', 'settings', 'email'
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### List Hygiene (Monthly Cleanup)

**Remove Immediately:**
- Hard bounces (email doesn't exist)
- Spam complaints
- Unsubscribes

**Segment/Review:**
- No opens in 6 months → Re-engagement campaign
- No opens in 9 months → Remove entirely
- 3+ soft bounces → Remove

**Result:** Smaller, cleaner list = BETTER deliverability

---

### Send Frequency Guidelines

**New Customers (First 30 days):** 6 emails - acceptable (transactional)  
**Active Customers:** 8-12 emails/year maximum  
**Lapsed:** 3 emails over 3 months, then pause  
**VIP Monthly:** 2/month + quarterly check-in

**GOLDEN RULE: Never more than 1 MARKETING email per week**

Too many = unsubscribes + spam complaints + Gmail filtering

---

### Personalization (Dramatically Improves Results)

**Use These Tokens:**
- First name in subject + greeting
- Vehicle make/model in content
- Last service date ("It's been 3 weeks...")
- Neighborhood/community name
- Service history specifics

**Examples:**
- ❌ Generic: "Book your next detail"
- ✅ Personalized: "Hi Michael, ready to detail your Tesla again?"

**Why It Works:**
- 26% higher open rates
- Feels personal, not mass email
- Harder to mistake for spam
- Signals relevance to Gmail/Outlook

---

## PART 4: AUTOMATION WORKFLOW LOGIC {#part-4}

### Master Decision Tree

**WHEN CUSTOMER BOOKS:**
```
├─ First booking?
│  ├─ YES → New Customer Flow (6 emails)
│  └─ NO → Repeat Customer Flow (4 emails)
│
├─ Came from referral?
│  ├─ YES → Send referral welcome + trigger referrer thank you
│  └─ NO → Standard flow
│
├─ Has upcoming booking?
│  ├─ YES → PAUSE all marketing emails
│  └─ NO → Continue normal cadence
│
└─ Is VIP (3+ bookings)?
   ├─ YES → Switch to VIP Flow
   └─ NO → Standard flow
```

**WHEN SERVICE COMPLETED:**
```
├─ Send thank you + receipt (immediate)
│
├─ Wait 7 days → Has review?
│  ├─ YES → Skip review request
│  └─ NO → Send review request
│
└─ Wait 21-30 days → Has upcoming booking?
   ├─ YES → Skip re-booking email
   └─ NO → Send re-booking invitation
```

**WHEN 90 DAYS PASS (No Booking):**
```
├─ Move to "LAPSED" status
├─ Send re-engagement #1 (friendly, no discount)
│
├─ Wait 30 days → Did they book?
│  ├─ YES → Back to Active
│  └─ NO → Send win-back #2 (15% off)
│
├─ Wait 60 more days → Did they book?
│  ├─ YES → Back to Active
│  └─ NO → Send final attempt #3 (feedback + 20% off)
│
└─ Still no booking at 180 days?
   └─ Move to INACTIVE (seasonal only)
```

**SEASONAL CAMPAIGNS:**
```
├─ Active? → Send all campaigns
├─ Lapsed (90-180 days)? → Spring + Fall only
├─ Inactive (180+)? → Spring only
└─ VIP Monthly? → SKIP all
```

**MONTHLY NEWSLETTER:**
```
├─ Opted in? → Continue
├─ Opened last 3? → Continue
├─ Booking in 14 days? → Skip
├─ Booked last 30 days? → Skip
└─ All pass → SEND
```

---

## PART 5: TRACKING & ANALYTICS DASHBOARD {#part-5}

### Key Performance Metrics

| Metric | Target | Action If Below |
|--------|--------|-----------------|
| Delivery Rate | 98%+ | Clean bounces, check DNS |
| Open Rate (Transactional) | 30-40% | Test subject lines |
| Open Rate (Marketing) | 20-30% | Better segmentation |
| Click-Through Rate | 15-25% | Improve CTAs |
| Spam Complaint Rate | <0.1% | Review content/frequency |
| Unsubscribe Rate | <0.5% | Reduce frequency |
| Conversion Rate (Re-booking) | 10-15% | Better offers |
| Bounce Rate | <2% | Monthly cleanup |

### Customer Lifecycle Metrics

| Metric | Target |
|--------|--------|
| Avg Days Between Bookings | 30-45 |
| Repeat Customer Rate | 60%+ |
| Customer Lifetime Bookings | 3.5+ |
| Churn Rate (6 months no booking) | <20% |
| Referral Rate | 15-25% |
| Email-Attributed Bookings | 30-40% |

### Customer Segmentation Dashboard

**Example After 12 Months:**

| Segment | Count | Email Strategy |
|---------|-------|----------------|
| VIP Monthly | 8 | Minimal (2/month + quarterly) |
| Active (<90 days) | 18 | Full flow + campaigns |
| Lapsed (90-180 days) | 12 | Re-engagement sequence |
| Inactive (180+ days) | 7 | Final attempt + Spring only |
| One-Time Only | 10 | Aggressive win-back |
| **TOTAL** | **55** | |

**Engagement Breakdown:**
- High (75%+ opens): 20 customers → Market heavily
- Medium (25-75% opens): 25 customers → Normal cadence
- Low (<25% opens): 10 customers → Re-engage or remove

---

## PART 6: SAMPLE EMAIL CALENDAR {#part-6}

### Example Month: March (Spring Campaign)

**WEEK 1:**
- Monday: Newsletter (20 emails)
- Wednesday: Spring campaign blast (55 emails)
- Friday: Review requests from last Saturday (4 emails)
- Saturday: 4 bookings → 4 thank you emails
- **Weekly Total: ~83 emails**

**WEEK 2:**
- Monday: Re-booking reminders (3 emails)
- Tuesday: Referral reminders (10 emails)
- Thursday: 48-hour booking reminders (4 emails)
- Saturday: 4 bookings → 4 thank you emails
- **Weekly Total: ~21 emails**

**WEEK 3:**
- Tuesday: Lapsed customer outreach (5 emails)
- Thursday: 48-hour reminders (4 emails)
- Friday: Review requests (4 emails)
- Saturday: 4 bookings → 4 thank you emails
- **Weekly Total: ~17 emails**

**WEEK 4:**
- Monday: Re-booking reminders (3 emails)
- Wednesday: VIP quarterly check-in (8 emails)
- Thursday: 48-hour reminders (4 emails)
- Saturday: 4 bookings → 4 thank you emails
- **Weekly Total: ~19 emails**

**MARCH TOTAL: ~140 emails (4.7% of 3,000 limit)**

---

## PART 7: IMPLEMENTATION ROADMAP {#part-7}

### Phase 1: Foundation (Week 1-2)

**Critical Setup:**
- ☐ Create Resend account
- ☐ Configure custom domain
- ☐ Add SPF, DKIM, DMARC to DNS (wait 24-48 hours)
- ☐ Design core templates (confirmation, reminder, thank you, review, rebooking)
- ☐ Set up customer database (Airtable, Notion, or spreadsheet)
- ☐ Create basic booking confirmation automation
- ☐ Test emails (yourself + friends, check spam folders)
- ☐ Verify deliverability

**Tools Needed:**
- Resend (email platform)
- Airtable/Notion (database)
- Zapier/Make (automation) OR custom code

---

### Phase 2: Core Flows (Week 3-4)

**Build Automations:**
- ☐ New customer onboarding (6 emails)
- ☐ Repeat customer flow (4 emails)
- ☐ Booking reminders (48-hour, day-before)
- ☐ Post-service thank you + receipt
- ☐ Review request (7 days after)
- ☐ Re-booking invitation (21-30 days)

**Testing:**
- ☐ Create test bookings
- ☐ Verify timing
- ☐ Check personalization tokens
- ☐ Confirm unsubscribe works
- ☐ Test across email clients (Gmail, Apple, Outlook, mobile)

---

### Phase 3: Advanced Features (Month 2)

**Add:**
- ☐ Referral program emails
- ☐ VIP customer flow
- ☐ Lapsed re-engagement (3-email sequence)
- ☐ First seasonal campaign

**Optimize:**
- ☐ A/B test subject lines
- ☐ Monitor open/click rates
- ☐ Adjust timing based on data
- ☐ Clean email list (remove bounces)

---

### Phase 4: Growth & Refinement (Month 3+)

**Expand:**
- ☐ Monthly newsletter (if desired)
- ☐ All 4 seasonal campaigns
- ☐ Customer surveys
- ☐ Win-back for inactive

**Analyze:**
- ☐ Monthly metrics review
- ☐ Customer lifetime value by segment
- ☐ Email ROI (bookings per email)
- ☐ Continuous improvement

---

## PART 8: EMAIL TEMPLATE EXAMPLES {#part-8}

### Template 1: Booking Confirmation (New Customer)

```
FROM: John Smith <john@prestigedetail.com>
SUBJECT: Your Saturday Detail is Confirmed ✓
PREVIEW: Hi Michael, we're excited to detail your Tesla this Saturday...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi Michael,

Welcome! We're excited to detail your 2023 Tesla Model 3 this Saturday.

📅 YOUR APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Date: Saturday, March 15, 2025
Time: 10:00 AM - 11:30 AM
Location: 123 Westwood Drive, Your City, CA 90210
Service: Exterior Rinsless Detail

[Add to Calendar Button]

WHAT TO EXPECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Our certified technician will arrive within your scheduled window
• Service takes approximately 60-90 minutes
• We use a premium waterless method - completely HOA-compliant
• You don't need to be home during service
• We'll text you 30 minutes before arrival

QUICK PREP CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

☐ Remove any items from car exterior
☐ Park in accessible, shaded area if possible
☐ That's it! We handle the rest

Questions? Just reply or call/text (555) 123-4567.

Looking forward to making your Tesla shine!

Best,
John Smith
Prestige Detail

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prestige Detail | Premium Rinsless Detailing
(555) 123-4567 | www.prestigedetail.com
123 Business St, Your City, CA 90210

[Update Preferences] | [Unsubscribe]
```

---

### Template 2: Re-Booking Invitation

```
FROM: John Smith <john@prestigedetail.com>
SUBJECT: Ready for Another Detail, Michael?
PREVIEW: It's been 3 weeks since we detailed your Tesla...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi Michael,

It's been 3 weeks since we detailed your Tesla Model 3, and it's 
probably ready for another round of that showroom shine.

Regular detailing protects your paint, maintains resale value, and 
prevents buildup that becomes harder to remove later.

OUR NEXT AVAILABLE SATURDAYS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

March 22 - 2 slots remaining
March 29 - 1 slot remaining  
April 5 - 3 slots available

[Book My Next Detail Button]

Remember: We only accept 4 bookings per Saturday. Slots fill up 
quickly, especially heading into spring.

Questions? Just hit reply.

Best,
John

P.S. You can rebook with one click - your details are saved.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prestige Detail
(555) 123-4567 | www.prestigedetail.com

[Unsubscribe]
```

---

### Template 3: Review Request

```
FROM: John Smith <john@prestigedetail.com>
SUBJECT: How did we do? (2-minute feedback)
PREVIEW: Hope you're enjoying your freshly detailed Tesla...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hi Michael,

Hope you're still enjoying your freshly detailed Tesla!

As a small business, your feedback truly matters. Would you mind 
taking 2 minutes to share your experience?

[Leave a Google Review Button]

Your review helps other luxury vehicle owners find us—and helps us 
continue improving.

Thank you for trusting us with your Tesla.

Best,
John Smith

P.S. Prefer private feedback? Just reply to this email.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prestige Detail
(555) 123-4567 | www.prestigedetail.com

[Unsubscribe]
```

---

## PART 9: RESEND SETUP GUIDE {#part-9}

### Step-by-Step Configuration

**STEP 1: Create Account**
1. Go to https://resend.com
2. Click "Sign Up"
3. Use your business email
4. Verify email address
5. Complete account setup

**STEP 2: Add Your Domain**
1. Settings → Domains → Add Domain
2. Enter: yourdomain.com (not full email)
3. Resend shows DNS records to add

**STEP 3: Configure DNS**

Go to your domain registrar (GoDaddy, Namecheap, etc.)

**Add 3 Records:**

**Record 1 - SPF:**
- Type: TXT
- Name: @ (or blank, or domain)
- Value: [Copy from Resend - starts with "v=spf1"]
- TTL: 3600

**Record 2 - DKIM:**
- Type: TXT
- Name: resend._domainkey
- Value: [Long string from Resend]
- TTL: 3600

**Record 3 - DMARC:**
- Type: TXT
- Name: _dmarc
- Value: v=DMARC1; p=none; rua=mailto:your@email.com
- TTL: 3600

**Wait 24-48 hours for DNS propagation**

**STEP 4: Verify Domain**
1. After 24-48 hours, back to Resend
2. Settings → Domains → Verify
3. Should see green checkmarks

If not verified:
- Double-check records are exact
- Wait another 24 hours
- Use DNS checker: whatsmydns.net

**STEP 5: Create API Key**
1. Settings → API Keys → Create
2. Name: "Production Key"
3. Permission: Full Access
4. Copy key IMMEDIATELY (can't see again)
5. Store securely

**STEP 6: Send Test Email**
- Use dashboard or API
- Send to yourself
- Check inbox (not spam)
- Verify sender shows your domain
- Test links and unsubscribe

**STEP 7: Monitor**
- Dashboard shows delivery, opens, clicks
- Check daily first week
- Monitor bounce/spam rates

---

## PART 10: MAINTENANCE & OPTIMIZATION {#part-10}

### Weekly Tasks

**EVERY MONDAY:**
- ☐ Review last week's performance
- ☐ Check bounce rate (<2%)
- ☐ Remove hard bounces
- ☐ Note spam complaints
- ☐ Plan this week's sends

**EVERY FRIDAY:**
- ☐ Verify Saturday booking reminders sent
- ☐ Review customer status changes
- ☐ Queue weekend follow-ups

---

### Monthly Tasks

**FIRST MONDAY OF MONTH:**

**Analytics:**
- ☐ Generate full report
- ☐ Review customer segments
- ☐ Track all key metrics

**List Hygiene:**
- ☐ Remove hard bounces
- ☐ Remove 3+ soft bounces
- ☐ Identify 6-month non-openers → re-engage
- ☐ Remove 9-month non-openers
- ☐ Check duplicates

**Planning:**
- ☐ Plan seasonal campaign (if applicable)
- ☐ A/B test one element
- ☐ Update templates if needed

---

### Quarterly Tasks

**EVERY 3 MONTHS:**

- ☐ Deep analytics dive
- ☐ Customer lifecycle analysis
- ☐ Template refresh
- ☐ Customer preference survey
- ☐ Review automation workflows
- ☐ Plan next quarter
- ☐ Competitive analysis

---

## FINAL SUMMARY

### Your Email System at a Glance

**Total Flows:** 7
1. New Customer (6 emails)
2. Repeat Customer (4 emails)
3. VIP Monthly (2/month + quarterly)
4. Referral (2 per event)
5. Lapsed (3 over 3 months)
6. Seasonal (4/year)
7. Newsletter (optional, 1/month)

**Monthly Volume:**
- Months 1-3: 100-150 emails
- Months 6-12: 150-250 emails
- Steady state: 200-300 emails/month

**Free Tier Usage:** 7-10% of 3,000 limit

**Key Success Factors:**
✓ Proper DNS setup (SPF, DKIM, DMARC)
✓ Personalization everywhere
✓ Smart segmentation
✓ Monthly list hygiene
✓ Engagement tracking
✓ Clear unsubscribe
✓ Valuable content
✓ Consistent sender
✓ Mobile optimization
✓ Regular testing

### System Goals

1. **CONVERT** new → repeat (60%+ retention)
2. **RETAIN** active customers
3. **RECOVER** lapsed before lost
4. **REWARD** VIP customers
5. **GENERATE** referrals (15-25%)
6. **MAINTAIN** professionalism
7. **AVOID** spam folders

### Red Flags

🚩 Delivery <95% → Check DNS, clean list
🚩 Opens <15% → Test subjects, check spam
🚩 Spam >0.1% → Review content/frequency
🚩 Unsubscribe >1% → Reduce frequency
🚩 Conversion <5% → Better offers/timing

---

**This system will automate customer retention, re-engagement, and referrals for your Saturday-only luxury detailing service while maintaining excellent deliverability and staying well within free email limits.**

**Next Steps:**
1. Set up Resend + DNS (Week 1)
2. Build core flows (Week 2-3)
3. Test with real bookings (Week 4)
4. Add advanced features (Month 2+)
5. Optimize continuously (Ongoing)

Within 6 months, email should drive 30-40% of your bookings automatically.

---

*Document Complete - Ready to Copy and Implement*  
*Version 1.0 | Saturday-Only Service Model*  
*Setup Time: 2-4 weeks | Maintenance: 2-3 hours/month*