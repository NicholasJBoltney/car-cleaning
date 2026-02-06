# Email Templates Checklist
## Complete List of All Email Templates Required

This document provides a comprehensive checklist of all email templates needed for the luxury car detailing platform's automated email system.

---

## FLOW 1: New Customer Onboarding (6 Emails)

### 1.1 Booking Confirmation (Day 0 - Immediate)
- **Template Name:** `new-customer-booking-confirmation`
- **Subject:** "Your Saturday Detail is Confirmed - [Date]"
- **Trigger:** First booking confirmed
- **Personalization:** First name, vehicle make/model/year, date, time, address
- **Content:**
  - Warm welcome message
  - Booking details (date, time, location, service type)
  - What to expect section
  - Preparation checklist
  - Contact information
  - Add to calendar CTA
- **Status:** ✅ Created

### 1.2 Service Reminder (Day -2, 48 hours before)
- **Template Name:** `new-customer-48hr-reminder`
- **Subject:** "Saturday Detail Reminder: We're Coming in 2 Days"
- **Trigger:** 48 hours before scheduled service
- **Personalization:** First name, vehicle, date, time
- **Content:**
  - Friendly reminder
  - Quick prep checklist
  - Weather check note
  - Reschedule link
- **Status:** ✅ Created

### 1.3 Tomorrow Reminder (Day -1, Optional - consider SMS)
- **Template Name:** `new-customer-tomorrow-reminder`
- **Subject:** "See You Tomorrow - Final Prep"
- **Trigger:** Day before service
- **Personalization:** First name, arrival time
- **Content:**
  - Brief, friendly tone (3-4 sentences max)
  - Arrival time window
  - 30-minute text notification promise
  - Last-minute contact info
- **Status:** ✅ Created

### 1.4 Thank You + Service Summary (Day 0 - After service)
- **Template Name:** `new-customer-thank-you`
- **Subject:** "Your [Vehicle] is Showroom Ready"
- **Trigger:** Service completion
- **Personalization:** First name, vehicle, service performed
- **Content:**
  - Genuine thank you
  - Service summary
  - Maintenance tips
  - Before/after photos (if available)
  - Receipt/invoice
  - Reply encouragement
  - NO review request (too soon)
- **Status:** ✅ Created

### 1.5 Review Request (Day +7)
- **Template Name:** `review-request`
- **Subject:** "How Did We Do? 2-Min Feedback"
- **Trigger:** 7 days after service (ONLY if no review submitted)
- **Personalization:** First name, vehicle
- **Content:**
  - Hope enjoying clean car
  - Importance of feedback for small business
  - Direct Google review link
  - Optional quick survey
  - Private feedback alternative
- **Status:** ✅ Created

### 1.6 Re-Booking Invitation (Day +21-30)
- **Template Name:** `new-customer-rebooking`
- **Subject:** "Time for Another Detail? Book Your Next Saturday"
- **Trigger:** 21-30 days after service (ONLY if no upcoming booking)
- **Personalization:** First name, vehicle, weeks since last service
- **Content:**
  - Time elapsed since last service
  - Benefits of regular maintenance
  - Limited Saturday availability
  - One-click rebooking
  - Optional: 10% first-time return discount
- **Status:** ✅ Created

---

## FLOW 2: Repeat Customer (4 Emails - Simplified)

### 2.1 Simple Confirmation (Day 0)
- **Template Name:** `repeat-customer-confirmation`
- **Subject:** "You're Booked - [Date]"
- **Trigger:** 2nd+ booking confirmed
- **Personalization:** First name, date, time, location
- **Content:**
  - "Welcome back!"
  - Date, time, location
  - Same great service promise
  - Add to calendar
  - SHORTER than new customer version
- **Status:** ✅ Created

### 2.2 Quick Reminder (Day -2)
- **Template Name:** `repeat-customer-reminder`
- **Subject:** "This Saturday - [Time]"
- **Trigger:** 48 hours before service
- **Personalization:** First name, time
- **Content:**
  - Brief reminder
  - Prep checklist link
  - Reschedule option
- **Status:** ✅ Created

### 2.3 Thank You + Next Steps (Day 0 - After service)
- **Template Name:** `repeat-customer-thank-you`
- **Subject:** "Thanks Again - See You Soon?"
- **Trigger:** Service completion
- **Personalization:** First name, vehicle
- **Content:**
  - Thank you
  - Service summary
  - Maintenance tips
  - Receipt
  - Soft CTA for next booking
- **Status:** ✅ Created

### 2.4 Re-Booking Prompt (Day +30)
- **Template Name:** `repeat-customer-rebooking`
- **Subject:** "Ready for Your Monthly Detail?"
- **Trigger:** 30 days after service (ONLY if no upcoming booking)
- **Personalization:** First name, time since last service
- **Content:**
  - One month elapsed
  - Keep that showroom shine
  - Book regular slot
- **Status:** ✅ Created

---

## FLOW 3: VIP/Monthly Subscriber (3 Emails)

### 3.1 Monthly Reminder (Day -2)
- **Template Name:** `vip-monthly-reminder`
- **Subject:** "Your Monthly Detail is This Saturday"
- **Trigger:** 48 hours before monthly recurring service
- **Personalization:** First name, date, time
- **Content:**
  - Brief reminder
  - Arrival time
  - Minimal text (they know the drill)
- **Status:** ✅ Created

### 3.2 Monthly Thank You (Day 0 - After service)
- **Template Name:** `vip-monthly-thank-you`
- **Subject:** "Thanks Again - See You Next Month"
- **Trigger:** Service completion
- **Personalization:** First name
- **Content:**
  - Thank you
  - Receipt
  - Next scheduled date
  - NO re-booking (already scheduled)
- **Status:** ✅ Created

### 3.3 Quarterly VIP Check-In (Every 3 months)
- **Template Name:** `vip-quarterly-checkin`
- **Subject:** "Thank You for Being a Valued Client"
- **Trigger:** Every 3 months from VIP start date
- **Personalization:** First name, duration as client, total bookings
- **Content:**
  - Personal thank you
  - "You've been with us for X months"
  - Exclusive VIP offer or early access
  - Referral reminder with incentive
  - Feedback request
- **Status:** ✅ Created

---

## FLOW 4: Referral Program (3 Emails)

### 4.1 Referrer Thank You + Credit (Immediate)
- **Template Name:** `referral-thank-you-referrer`
- **Subject:** "Thanks for the Referral! $20 Credit Added"
- **Trigger:** When referred person books
- **Personalization:** Referrer first name, referred person name, credit amount
- **Content:**
  - Thank you for referring [Friend Name]
  - $20 credit added notification
  - Use on next service
  - Refer more, earn more
  - Share link for easy referring
- **Status:** ✅ Created

### 4.2 New Customer Welcome (via Referral)
- **Template Name:** `referral-welcome-new-customer`
- **Subject:** "Welcome! [Referrer] Recommended Us + You Get $10 Off"
- **Trigger:** Booking confirmed from referral
- **Personalization:** New customer name, referrer name, discount amount
- **Content:**
  - Personal intro via referrer
  - $10 discount applied to first booking
  - Standard booking confirmation details
  - Join them in keeping vehicle pristine
- **Status:** ✅ Created

### 4.3 Referral Program Reminder (Every 3 months)
- **Template Name:** `referral-reminder`
- **Subject:** "Know Someone with a Dirty [Tesla/BMW]?"
- **Trigger:** Quarterly to active customers who haven't referred
- **Personalization:** First name, vehicle type
- **Content:**
  - Love your clean car? Share the love
  - You get $20, they get $10
  - Easy share buttons
  - Personal referral link
  - Light example copy
  - NOT pushy tone
- **Status:** ✅ Created

---

## FLOW 5: Lapsed Customer Re-Engagement (3 Emails over 6 months)

### 5.1 Friendly Check-In (Day 90)
- **Template Name:** `lapsed-friendly-checkin`
- **Subject:** "We Miss Your [Vehicle Model]!"
- **Trigger:** 90 days since last booking, no upcoming appointment
- **Personalization:** First name, vehicle make/model
- **Content:**
  - It's been a while
  - Hope everything is going well
  - We'd love to help keep it looking great
  - Reminder of what they loved
  - Easy re-booking link
  - NO discount yet
- **Status:** ✅ Created

### 5.2 Win-Back Offer (Day 120)
- **Template Name:** `lapsed-winback-offer`
- **Subject:** "Come Back - 15% Off Your Next Detail"
- **Trigger:** 120 days (if no response to previous)
- **Personalization:** First name, discount percentage
- **Content:**
  - We'd love to earn your business back
  - 15% off welcome back offer
  - Expires in 30 days (urgency)
  - Book now - Saturdays fill up fast
- **Status:** ✅ Created

### 5.3 Final Attempt + Feedback (Day 180)
- **Template Name:** `lapsed-final-attempt`
- **Subject:** "Before You Go... Can We Improve?"
- **Trigger:** 180 days (if still no response)
- **Personalization:** First name
- **Content:**
  - Noticed you haven't booked lately
  - Was there something we could improve?
  - Quick 2-question survey
  - OR 20% off if returning
  - Graceful unsubscribe option
- **Status:** ✅ Created

---

## FLOW 6: Seasonal Campaigns (4 Per Year)

### 6.1 Spring Campaign (March)
- **Template Name:** `seasonal-spring`
- **Subject:** "Spring Clean Your [Vehicle] - Book Now"
- **Trigger:** March (send to ALL customers)
- **Personalization:** First name, vehicle
- **Content:**
  - Remove winter grime, salt, dirt
  - Get ready for top-down driving season
  - Limited Saturday slots
  - Optional: Early bird discount
- **Status:** ✅ Created

### 6.2 Summer Campaign (June)
- **Template Name:** `seasonal-summer`
- **Subject:** "Protect Your Paint This Summer"
- **Trigger:** June (Active + Lapsed only)
- **Personalization:** First name, vehicle
- **Content:**
  - UV damage risks
  - Importance of regular maintenance
  - Keep showroom shine all summer
  - Book before vacation season
- **Status:** ✅ Created

### 6.3 Fall Campaign (September)
- **Template Name:** `seasonal-fall`
- **Subject:** "Prep Your Car for Fall/Winter"
- **Trigger:** September (Active + Lapsed)
- **Personalization:** First name, vehicle
- **Content:**
  - Falling leaves, tree sap, pollen
  - Protect before harsh weather
  - Get it done before holiday rush
- **Status:** ✅ Created

### 6.4 Winter Campaign (December)
- **Template Name:** `seasonal-winter-gift`
- **Subject:** "Give the Gift of a Clean Car"
- **Trigger:** December (Active customers only)
- **Personalization:** First name
- **Content:**
  - Gift certificates available
  - Perfect for car-loving friends/family
  - Digital delivery
  - Valid for 12 months
  - Secondary: "Or treat yourself before New Year's"
- **Status:** ✅ Created

---

## FLOW 7: Monthly Newsletter (OPTIONAL)

### 7.1 Monthly Newsletter Template
- **Template Name:** `monthly-newsletter`
- **Subject:** "[Month] Car Care Tips + Updates"
- **Trigger:** Once per month (opted-in customers only)
- **Personalization:** First name, month
- **Content:**
  - **Section 1:** Educational tip (300 words) - tree sap removal, ceramic coating care, etc.
  - **Section 2:** Behind the scenes - recent transformation photo, personal update
  - **Section 3:** Availability update - next month's slots + soft booking CTA
  - **Section 4:** Customer spotlight (optional) - feature happy customer
  - Footer with unsubscribe
- **Skip if:** Customer has booking in next 14 days OR booked in last 30 days
- **Status:** ✅ Created

---

## SYSTEM/TRANSACTIONAL EMAILS

### 8.1 Welcome Email (Post Sign-Up)
- **Template Name:** `system-welcome`
- **Subject:** "Welcome to [Company Name] - Manage Your Preferences"
- **Trigger:** User signs up via magic link
- **Personalization:** First name
- **Content:**
  - Thanks for signing up
  - Email preference center link
  - What emails they'll receive by default
  - Opt-in invitation for special offers
- **Status:** ✅ Created

### 8.2 Password Reset (if applicable)
- **Template Name:** `system-password-reset`
- **Subject:** "Reset Your Password"
- **Trigger:** User requests password reset
- **Personalization:** First name
- **Content:**
  - Password reset link
  - Expires in 24 hours
  - Didn't request? Contact us
- **Status:** ✅ Created

### 8.3 Email Preference Update Confirmation
- **Template Name:** `system-preference-update`
- **Subject:** "Your Email Preferences Updated"
- **Trigger:** User updates email preferences
- **Personalization:** First name
- **Content:**
  - Confirmation of changes
  - Current preferences summary
  - Update anytime link
- **Status:** ✅ Created

### 8.4 Unsubscribe Confirmation
- **Template Name:** `system-unsubscribe-confirmation`
- **Subject:** "You've Been Unsubscribed"
- **Trigger:** User clicks unsubscribe
- **Personalization:** First name
- **Content:**
  - Confirmation message
  - You'll still receive booking confirmations
  - Option to update preferences instead
  - Re-subscribe link
- **Status:** ✅ Created

---

## SUMMARY STATISTICS

### Total Email Templates Required: **28**

**By Flow:**
- Flow 1 (New Customer): 6 emails
- Flow 2 (Repeat Customer): 4 emails
- Flow 3 (VIP): 3 emails
- Flow 4 (Referral): 3 emails
- Flow 5 (Lapsed): 3 emails
- Flow 6 (Seasonal): 4 emails
- Flow 7 (Newsletter): 1 email
- System/Transactional: 4 emails

### Priority Order for Implementation:

**Phase 1 - Critical (Week 1-2):**
1. ✅ Booking Confirmation (new customer)
2. ✅ 48-hour Reminder (new customer)
3. ✅ Thank You + Service Summary (new customer)
4. ✅ Welcome Email (system)
5. ✅ Booking Confirmation (repeat customer)

**Phase 2 - Core Flows (Week 3-4):**
6. Review Request
7. Re-booking Invitation (new customer)
8. Repeat customer reminder
9. Repeat customer thank you
10. Repeat customer re-booking

**Phase 3 - Advanced (Month 2):**
11. VIP monthly reminder
12. VIP monthly thank you
13. VIP quarterly check-in
14. Referral thank you (referrer)
15. Referral welcome (new customer)
16. Referral reminder

**Phase 4 - Re-engagement (Month 2-3):**
17. Lapsed friendly check-in
18. Lapsed win-back offer
19. Lapsed final attempt

**Phase 5 - Seasonal (Month 3+):**
20. Spring campaign
21. Summer campaign
22. Fall campaign
23. Winter/gift campaign

**Phase 6 - Optional (Month 4+):**
24. Monthly newsletter
25. Email preference update confirmation
26. Unsubscribe confirmation
27. Password reset (if needed)
28. Tomorrow reminder (or replace with SMS)

---

## TECHNICAL REQUIREMENTS PER EMAIL

Each email template requires:
- ✅ HTML version (responsive design)
- ✅ Plain text version (fallback)
- ✅ Mobile-optimized layout
- ✅ Personalization tokens (first name, vehicle, dates, etc.)
- ✅ Unsubscribe link in footer
- ✅ Company info + physical address (CAN-SPAM compliance)
- ✅ Alt text for all images
- ✅ Clear single CTA button
- ✅ Preview text optimization
- ✅ Test across email clients (Gmail, Apple, Outlook, mobile)

---

## NOTES

- **SMS Alternative:** Consider replacing "Tomorrow Reminder" (1.3) with SMS for better engagement
- **Newsletter:** Optional - only implement if resources allow
- **VIP Review Requests:** Only send review requests to VIP customers every 6 months, not after every service
- **Segmentation:** Always check customer status and booking history before sending re-booking emails
- **Opt-In Compliance:** All marketing emails require `email_opt_in = TRUE` in database
- **Personalization:** Use vehicle make/model, first name, and service dates wherever possible for higher engagement

---

## CHECKLIST USAGE

Mark templates as:
- ⬜ Not Created
- 🔨 In Progress
- ✅ Created (not tested)
- ✔️ Created and Tested
- 🚀 Live in Production

Track completion status by updating the checkboxes above.

---

**Document Version:** 1.0
**Last Updated:** 2026-02-06
**Total Templates:** 28
**Status:** Ready for Implementation
