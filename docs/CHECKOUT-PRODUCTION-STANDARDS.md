# Checkout Page Production Standards & Issues

**File**: `/app/book/checkout/page.tsx`

**Purpose**: Handles the final payment flow for car cleaning service bookings via Paystack payment gateway.

---

## Table of Contents
1. [What the File Does](#what-the-file-does)
2. [Critical Security Issues](#critical-security-issues)
3. [Architectural Issues](#architectural-issues)
4. [Data Integrity Issues](#data-integrity-issues)
5. [Operational Issues](#operational-issues)
6. [Compliance Issues](#compliance-issues)
7. [User Experience Issues](#user-experience-issues)
8. [Production Checklist](#production-checklist)
9. [Recommended Refactor](#recommended-refactor)

---

## What the File Does

The checkout page performs the following operations:

1. **Receives booking data** from previous booking steps via URL query parameters (JSON-encoded)
2. **Loads Paystack payment gateway** script (South African payment processor)
3. **Displays booking summary** with pricing breakdown:
   - Base service cost
   - Add-on services
   - VAT (15%)
   - Grand total
4. **Initializes payment** via Paystack inline popup
5. **On payment success**, creates database records in sequence:
   - User profile (or finds existing user)
   - Vehicle record
   - Booking record with payment reference
   - Booking add-ons
6. **Redirects to success page** with booking ID

---

## Critical Security Issues

### 1. Passing Sensitive Data via URL Parameters ⚠️ CRITICAL

**Issue Location**: Lines 18-30

**Problem**:
- Booking data (including prices and totals) is encoded in URL query string
- Exposed in:
  - Browser history
  - Server logs
  - Referrer headers
  - Intermediate proxies and CDNs
  - Analytics tracking
- Violates PCI-DSS compliance (payment data must never be logged)
- User can accidentally share checkout link containing sensitive data

**Example Vulnerability**:
```
https://example.com/book/checkout?data=%7B%22grand_total%22%3A2500%2C%22email%22%3A%22user%40test.com%22%7D
```

**Professional Solution**:

**Option A: Session-Based State**
```typescript
// Step 1: Booking form submits to API route
// POST /api/bookings/prepare-checkout
export async function POST(request: Request) {
  const bookingData = await request.json();

  // Validate data
  const validated = BookingDataSchema.parse(bookingData);

  // Store in secure session
  const sessionId = generateSecureId();
  await storeInRedis(sessionId, validated, expiresIn: 300); // 5 min TTL

  return Response.json({ sessionId });
}

// Step 2: Redirect to checkout with only session ID
// router.push(`/book/checkout?session=${sessionId}`);

// Step 3: In checkout page, retrieve data server-side
const bookingData = await getFromRedis(searchParams.get('session'));
```

**Option B: Encrypted & Signed Payload**
```typescript
import { createHmac } from 'crypto';

// Encrypt on booking form
const encrypted = encryptData(bookingData, SECRET_KEY);
const signature = createHmac('sha256', SECRET_KEY).update(encrypted).digest('hex');

// Pass: router.push(`/book/checkout?payload=${encrypted}&sig=${signature}`);

// Verify in checkout page
const bookingData = decryptAndVerify(
  searchParams.get('payload'),
  searchParams.get('sig'),
  SECRET_KEY
);
```

**Why This Matters**:
- Compliance with PCI-DSS standards
- Prevents data leakage in logs
- Reduces liability in case of breach
- Industry standard for payment flows

---

### 2. No Server-Side Payment Verification ⚠️ CRITICAL

**Issue Location**: Lines 72-78

**Problem**:
- Paystack `onSuccess` callback is called client-side after payment form closes
- This callback can be spoofed with browser DevTools or intercepted
- No verification that payment actually succeeded
- User sees "payment complete" even if transaction failed
- Database records created without confirming funds were received

**Example Attack**:
```javascript
// Attacker can call in browser console
handleSuccessfulPayment('fake-reference', 'fake-our-ref');
// Booking created without actual payment
```

**Professional Solution**:

Create a backend API route for verification:

```typescript
// /app/api/payments/verify/route.ts
import { supabase } from '@/lib/supabase/server';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

export async function POST(request: Request) {
  try {
    const { reference } = await request.json();

    // Validate reference format
    if (!reference || typeof reference !== 'string') {
      return Response.json(
        { error: 'Invalid reference' },
        { status: 400 }
      );
    }

    // Verify with Paystack using SECRET key (server-side only)
    const verifyResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    if (!verifyResponse.ok) {
      return Response.json(
        { error: 'Payment verification failed' },
        { status: 402 } // Payment Required
      );
    }

    const { data: paymentData } = await verifyResponse.json();

    // Verify payment actually succeeded
    if (paymentData.status !== 'success') {
      return Response.json(
        { error: 'Payment not completed', status: paymentData.status },
        { status: 402 }
      );
    }

    // Verify amount matches (prevent tampering)
    const expectedAmount = request.headers.get('x-expected-amount');
    if (paymentData.amount !== parseInt(expectedAmount) * 100) {
      // Paystack stores amounts in cents
      return Response.json(
        { error: 'Amount mismatch - possible fraud' },
        { status: 400 }
      );
    }

    // Payment verified - safe to create booking
    return Response.json({ verified: true, data: paymentData });
  } catch (error) {
    console.error('Payment verification error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Update checkout to use verification:

```typescript
const handleSuccessfulPayment = async (paystackReference: string) => {
  try {
    // Verify payment FIRST
    const verifyResponse = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-expected-amount': bookingData.grand_total.toString(),
      },
      body: JSON.stringify({ reference: paystackReference }),
    });

    if (!verifyResponse.ok) {
      throw new Error('Payment verification failed');
    }

    const { verified } = await verifyResponse.json();
    if (!verified) {
      throw new Error('Payment was not verified by Paystack');
    }

    // ONLY NOW proceed to create booking
    await createBooking(paystackReference);
  } catch (error) {
    handlePaymentError(error);
  }
};
```

**Why This Matters**:
- Guarantees payment actually succeeded
- Prevents fraudulent bookings
- Complies with payment processor requirements
- Required for PCI-DSS compliance

---

## Architectural Issues

### 3. User Creation During Payment Flow ⚠️ ARCHITECTURAL

**Issue Location**: Lines 94-127

**Problem**:
- User authentication happens AFTER payment succeeds
- Creates race conditions if multiple callbacks fire
- Magic link OTP delays booking completion
- User might not verify email, booking left incomplete
- Foreign key constraint fails if user creation fails
- No guarantee user will ever verify email
- Session not established, RLS policies may not apply correctly

**Sequence of Problems**:
```
1. User clicks "Pay" → Payment modal appears
2. User closes/refreshes → Payment callback still fires
3. Multiple `handleSuccessfulPayment` calls race each other
4. Both create user, both try to create booking
5. Result: Duplicate bookings or database constraint errors
```

**Professional Solution**:

**Move authentication BEFORE checkout** - Restructure booking flow:

```typescript
// Update /app/book/page.tsx to add auth check at start:

export default function BookingPage() {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return <RedirectToLogin />;
  }

  // User already authenticated - proceed with booking flow
  return <BookingFlow userId={session.user.id} />;
}
```

Or add **login as Step 0**:

```typescript
// Step 0: Authentication
if (!currentUser) {
  return <AuthenticationStep onSuccess={() => setStep(1)} />;
}

// Step 1: Vehicle info
if (step === 1) return <Step1Vehicle />;
// ...etc
```

Benefits:
- User already exists before payment
- No race conditions
- RLS policies work correctly
- Simpler error handling
- Payment references map to existing users

---

## Data Integrity Issues

### 4. No Database Transactions ⚠️ DATA INTEGRITY

**Issue Location**: Lines 138-215

**Problem**:
- Series of independent INSERT/UPSERT calls without atomicity
- If booking creation fails after payment succeeds, money is taken but no booking exists
- "Orphaned transaction" - payment recorded but no database record
- Inconsistent state: payment_status='paid' but no booking to reference it
- Manual intervention required to reconcile

**Example Failure**:
```
1. Payment succeeds (Paystack confirms)
2. Vehicle insert works (vehicleData = {...})
3. Booking insert fails (constraint violation, DB error, timeout)
4. Payment exists but booking doesn't
5. Customer money taken, no booking created, manual support needed
```

**Professional Solution**:

**Create Supabase RPC (stored procedure) for atomicity**:

```sql
-- /lib/supabase/functions/create_booking_after_payment.sql
CREATE OR REPLACE FUNCTION create_booking_after_payment(
  p_user_id uuid,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_phone text,
  p_brand text,
  p_model text,
  p_year int,
  p_size_category text,
  p_color text,
  p_license_plate text,
  p_slot_id uuid,
  p_service_type text,
  p_address text,
  p_suburb text,
  p_city text,
  p_postal_code text,
  p_gate_notes text,
  p_special_requests text,
  p_base_price decimal,
  p_addon_price decimal,
  p_vat_amount decimal,
  p_grand_total decimal,
  p_payment_reference text,
  p_selected_addons uuid[]
)
RETURNS jsonb AS $$
DECLARE
  v_vehicle_id uuid;
  v_booking_id uuid;
BEGIN
  -- All operations in single transaction

  -- 1. Create/update user profile
  INSERT INTO user_profiles (user_id, first_name, last_name, email, phone, address, city, postal_code)
  VALUES (p_user_id, p_first_name, p_last_name, p_email, p_phone, p_address, p_city, p_postal_code)
  ON CONFLICT (user_id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    email = EXCLUDED.email,
    phone = EXCLUDED.phone;

  -- 2. Create vehicle
  INSERT INTO vehicles (user_id, brand, model, year, size_category, color, license_plate)
  VALUES (p_user_id, p_brand, p_model, p_year, p_size_category, p_color, p_license_plate)
  RETURNING id INTO v_vehicle_id;

  -- 3. Create booking
  INSERT INTO bookings (
    user_id, vehicle_id, slot_id, status, service_type, address, suburb, city, postal_code,
    gate_access_notes, special_requests, base_price, addon_price, vat_amount, grand_total,
    payment_status, payment_reference
  )
  VALUES (
    p_user_id, v_vehicle_id, p_slot_id, 'confirmed', p_service_type, p_address, p_suburb, p_city,
    p_postal_code, p_gate_notes, p_special_requests, p_base_price, p_addon_price, p_vat_amount,
    p_grand_total, 'paid', p_payment_reference
  )
  RETURNING id INTO v_booking_id;

  -- 4. Add booking addons (if any)
  IF array_length(p_selected_addons, 1) > 0 THEN
    INSERT INTO booking_addons (booking_id, addon_id, quantity, price_at_booking)
    SELECT v_booking_id, addon_id, 1, price
    FROM service_addons
    WHERE id = ANY(p_selected_addons);
  END IF;

  -- All succeeded - return success
  RETURN jsonb_build_object(
    'success', true,
    'booking_id', v_booking_id,
    'vehicle_id', v_vehicle_id
  );

EXCEPTION WHEN OTHERS THEN
  -- If anything fails, entire transaction rolls back
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql;
```

Use in checkout:

```typescript
const result = await supabase.rpc('create_booking_after_payment', {
  p_user_id: userId,
  p_first_name: bookingData.first_name,
  // ... all parameters
  p_selected_addons: bookingData.selected_addons,
});

if (!result.data.success) {
  throw new Error(result.data.error);
}

const { booking_id } = result.data;
```

**Why This Matters**:
- All-or-nothing atomicity
- No orphaned payments
- Database consistency guaranteed
- No manual reconciliation needed

---

## Operational Issues

### 5. Inadequate Error Handling ⚠️ OPERATIONAL

**Issue Location**: Lines 219-225

**Problem**:
- Generic alert() for all errors
- No structured logging
- No error categorization (network vs. database vs. validation)
- Manual intervention mentioned but no process defined
- No way to track which bookings failed
- Customer has no clear next steps

**Current Code**:
```typescript
catch (error: any) {
  console.error('Final Booking Error Detail:', error);
  alert(`Payment was successful... but we encountered an error... Our team has been notified...`);
}
```

**Issues**:
- console.error only visible in dev tools (user won't see)
- "Our team has been notified" but there's no actual notification system
- No support ticket created
- No retry mechanism

**Professional Solution**:

```typescript
// Setup error tracking - add to env
// NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
import * as Sentry from "@sentry/nextjs";

// Categorize errors
const categorizeError = (error: any): {
  type: 'network' | 'validation' | 'payment' | 'database' | 'unknown',
  recoverable: boolean,
  userMessage: string
} => {
  if (error.message.includes('verify')) {
    return {
      type: 'payment',
      recoverable: true,
      userMessage: 'Payment verification failed. Please try again.'
    };
  }
  if (error.code === '23505') { // Unique constraint
    return {
      type: 'database',
      recoverable: false,
      userMessage: 'This booking already exists.'
    };
  }
  if (error instanceof TypeError) {
    return {
      type: 'network',
      recoverable: true,
      userMessage: 'Connection lost. Please check your internet and try again.'
    };
  }
  return {
    type: 'unknown',
    recoverable: true,
    userMessage: 'An unexpected error occurred.'
  };
};

// Enhanced error handling
try {
  await handleSuccessfulPayment(paystackReference);
} catch (error: any) {
  const { type, recoverable, userMessage } = categorizeError(error);

  // 1. Log to error tracking service
  Sentry.captureException(error, {
    level: recoverable ? 'warning' : 'error',
    tags: {
      component: 'checkout',
      error_type: type,
      payment_reference: paystackReference,
    },
    extra: {
      user_email: bookingData?.email,
      booking_amount: bookingData?.grand_total,
      stack: error.stack,
    },
    contexts: {
      checkout: {
        step: 'payment_processing',
        timestamp: new Date().toISOString(),
      }
    }
  });

  // 2. Notify support team for critical errors
  if (!recoverable) {
    await notifySupport({
      type: 'CRITICAL_BOOKING_FAILURE',
      payment_reference: paystackReference,
      user_email: bookingData?.email,
      error_message: error.message,
      error_type: type,
      amount: bookingData?.grand_total,
      timestamp: new Date(),
    });

    // Create support ticket
    await createSupportTicket({
      title: `Failed Booking - ${paystackReference}`,
      priority: 'high',
      description: `Payment succeeded but booking creation failed.\n\nPayment Ref: ${paystackReference}\nAmount: R${bookingData?.grand_total}\nUser: ${bookingData?.email}\nError: ${error.message}`,
    });
  }

  // 3. Attempt recovery if possible
  if (type === 'network' && recoverable) {
    // Implement exponential backoff retry
    await retryWithBackoff(() => handleSuccessfulPayment(paystackReference));
  }

  // 4. Queue failed booking for manual review
  await queueFailedBooking({
    payment_reference: paystackReference,
    booking_data: sanitizeForLogging(bookingData),
    error_type: type,
    error_message: error.message,
    timestamp: new Date(),
  });

  // 5. Show appropriate user message
  if (recoverable) {
    setRetryAvailable(true);
    alert(userMessage + '\nBooking reference: ' + paystackReference);
  } else {
    alert(userMessage + '\nOur support team has been notified.\nReference: ' + paystackReference);
  }
}
```

**Why This Matters**:
- Visibility into what's failing
- Automated alerting for critical issues
- Clear user communication
- Ability to retry or recover
- Support team can track issues

---

### 6. No Idempotency Handling ⚠️ OPERATIONAL

**Issue Location**: Lines 86-225

**Problem**:
- Network timeout → browser retries → multiple `handleSuccessfulPayment` calls
- User double-clicks button → executes twice
- Browser back/forward → payment flow triggered again
- Result: Duplicate bookings for same payment reference

**Example**:
```
1. User clicks "Pay with Paystack"
2. Payment succeeds, onSuccess fires
3. Network timeout before redirect
4. User clicks back → retries payment → same reference returned
5. onSuccess fires again, creates second booking
6. Two bookings, one payment
```

**Professional Solution**:

```typescript
// Add idempotency check to payment handler
const handleSuccessfulPayment = async (
  paystackReference: string,
  ourReference: string
) => {
  try {
    // Check if this payment already created a booking
    const { data: existingBooking } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('payment_reference', paystackReference)
      .maybeSingle();

    // Already processed - return existing booking
    if (existingBooking) {
      console.log('Idempotent: Booking already exists', existingBooking.id);
      router.push(`/book/success?booking_id=${existingBooking.id}`);
      return;
    }

    // Prevent concurrent processing with in-memory flag
    if (processingReferences.has(paystackReference)) {
      console.log('Already processing this reference');
      return;
    }
    processingReferences.add(paystackReference);

    // Safe to proceed - create booking
    const booking = await createBookingAfterPayment(paystackReference);

    processingReferences.delete(paystackReference);
    router.push(`/book/success?booking_id=${booking.id}`);

  } catch (error) {
    // Clean up processing flag
    processingReferences.delete(paystackReference);
    throw error;
  }
};

// In-memory set to prevent concurrent processing
const processingReferences = new Set<string>();
```

Add database unique constraint:

```sql
-- Ensure payment_reference is unique across all bookings
ALTER TABLE bookings ADD CONSTRAINT unique_payment_reference
UNIQUE(payment_reference);
```

**Why This Matters**:
- Prevents duplicate bookings
- Handles network timeouts gracefully
- Safe to retry failed operations
- Industry standard for payment processing (RFC 7231)

---

## Compliance Issues

### 7. Missing Compliance & Audit Trail ⚠️ COMPLIANCE

**Issue Location**: Throughout file

**Problem**:
- No audit logging of payment events
- Payment amounts logged in plaintext (violates PCI-DSS)
- No data retention policy
- GDPR requests cannot be fulfilled (no way to find user data)
- No encrypted payment references
- Regulatory audits would fail

**PCI-DSS Violation**: Storing sensitive cardholder data or payment details anywhere.

**Professional Solution**:

```typescript
// /lib/payment-audit.ts
import { supabase } from '@/lib/supabase/server';

interface PaymentAuditEvent {
  event_type: 'payment_initiated' | 'payment_verified' | 'payment_failed' | 'booking_created';
  user_id: string;
  email_hash: string; // Hash, not plaintext
  amount_range: string; // Bucketed: '1000-2000' not exact
  currency: 'ZAR';
  payment_provider: 'paystack';
  payment_reference_hash: string; // SHA256 hash
  timestamp: Date;
  ip_address_hash: string;
  status: 'success' | 'failure' | 'pending';
  error_code?: string; // Don't log error message
}

export const auditPaymentEvent = async (event: PaymentAuditEvent) => {
  // Store in audit-only table with restricted access
  const { error } = await supabase
    .from('payment_audit_log')
    .insert([{
      ...event,
      timestamp: event.timestamp.toISOString(),
    }]);

  if (error) {
    console.error('Audit logging failed:', error);
    // Don't throw - payment processing shouldn't fail due to logging
  }
};

// Bucketing function to avoid logging exact amounts
const getBucketedAmount = (amount: number): string => {
  const bucket = Math.floor(amount / 1000) * 1000;
  return `ZAR_${bucket}-${bucket + 1000}`;
};

// Hash sensitive data
const hashEmail = (email: string): string => {
  return crypto.createHash('sha256').update(email).digest('hex');
};

const hashPaymentReference = (ref: string): string => {
  return crypto.createHash('sha256').update(ref).digest('hex');
};
```

Usage in checkout:

```typescript
// Before payment
await auditPaymentEvent({
  event_type: 'payment_initiated',
  user_id: userId,
  email_hash: hashEmail(bookingData.email),
  amount_range: getBucketedAmount(bookingData.grand_total),
  currency: 'ZAR',
  payment_provider: 'paystack',
  payment_reference_hash: hashPaymentReference(paymentReference),
  timestamp: new Date(),
  ip_address_hash: hashEmail(req.ip || 'unknown'),
  status: 'pending',
});

// After verification
await auditPaymentEvent({
  event_type: 'payment_verified',
  user_id: userId,
  email_hash: hashEmail(bookingData.email),
  amount_range: getBucketedAmount(bookingData.grand_total),
  currency: 'ZAR',
  payment_provider: 'paystack',
  payment_reference_hash: hashPaymentReference(paymentReference),
  timestamp: new Date(),
  ip_address_hash: hashEmail(req.ip || 'unknown'),
  status: 'success',
});
```

Database table:

```sql
CREATE TABLE payment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  email_hash text NOT NULL,
  amount_range text NOT NULL,
  currency text NOT NULL,
  payment_provider text NOT NULL,
  payment_reference_hash text NOT NULL UNIQUE,
  timestamp timestamptz NOT NULL,
  ip_address_hash text,
  status text NOT NULL,
  error_code text,
  created_at timestamptz DEFAULT now()
);

-- RLS: Only admin can view
ALTER TABLE payment_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_view" ON payment_audit_log FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Immutable log - no updates/deletes
CREATE POLICY "no_update" ON payment_audit_log FOR UPDATE
USING (false);
CREATE POLICY "no_delete" ON payment_audit_log FOR DELETE
USING (false);

-- Data retention: 7 years (South African tax requirement)
-- Setup via: ALTER TABLE payment_audit_log SET (autovacuum_vacuum_scale_factor = 0.1);
```

**Why This Matters**:
- PCI-DSS compliance requirement
- Ability to respond to regulatory audits
- GDPR data subject access requests
- Fraud detection and investigation
- Legal liability protection

---

## User Experience Issues

### 8. Email Notifications Not Implemented ⚠️ USER EXPERIENCE

**Issue Location**: UI Line 335 promises emails not sent in code

**Problem**:
UI states: "You'll receive a booking confirmation email"
**Code reality**: No email is sent anywhere

**Professional Solution**:

```typescript
// /app/api/emails/send-confirmation/route.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const {
      user_id,
      booking_id,
      email,
      first_name,
      saturday_date,
      time_slot,
      vehicle_brand,
      vehicle_model,
      grand_total,
      unsubscribe_token,
    } = await request.json();

    // Validate required fields
    if (!email || !booking_id) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'noreply@carpreservation.co.za',
      to: email,
      subject: 'Booking Confirmed - Car Preservation',
      html: `
        <h1>Booking Confirmed</h1>
        <p>Hi ${first_name},</p>
        <p>Your car preservation booking has been confirmed!</p>

        <h2>Booking Details</h2>
        <ul>
          <li><strong>Booking ID:</strong> ${booking_id}</li>
          <li><strong>Date:</strong> ${saturday_date} at ${time_slot}</li>
          <li><strong>Vehicle:</strong> ${vehicle_brand} ${vehicle_model}</li>
          <li><strong>Amount Paid:</strong> R${grand_total.toFixed(2)}</li>
        </ul>

        <h2>What Happens Next</h2>
        <ol>
          <li>We'll send you an SMS reminder 24 hours before service</li>
          <li>Our team will arrive at the scheduled time</li>
          <li>You'll receive a digital health report with photos after completion</li>
        </ol>

        <h2>Need Help?</h2>
        <p>Reply to this email or contact us at support@carpreservation.co.za</p>

        <hr>
        <p>
          <a href="https://app.carpreservation.co.za/portal/bookings/${booking_id}">
            View Booking in Portal
          </a>
        </p>

        <p style="font-size: 12px; color: #666;">
          <a href="https://app.carpreservation.co.za/unsubscribe?token=${unsubscribe_token}">
            Unsubscribe from emails
          </a>
        </p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return Response.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Log email sent
    await auditPaymentEvent({
      event_type: 'confirmation_email_sent',
      user_id,
      email_hash: hashEmail(email),
      timestamp: new Date(),
      status: 'success',
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email route error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

Call from checkout after booking created:

```typescript
// After booking successfully created
await fetch('/api/emails/send-confirmation', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    booking_id: bookingDataResult.id,
    email: bookingData.email,
    first_name: bookingData.first_name,
    saturday_date: bookingData.saturday_date,
    time_slot: bookingData.time_slot,
    vehicle_brand: bookingData.new_vehicle?.brand,
    vehicle_model: bookingData.new_vehicle?.model,
    grand_total: bookingData.grand_total,
    unsubscribe_token: generateUnsubscribeToken(userId),
  }),
});
```

**Why This Matters**:
- Fulfills promise made in UI
- Increases customer confidence
- Reduces support inquiries ("Did my booking work?")
- Enables communication channel
- Professional customer experience

---

### 9. Missing Webhook Integration ⚠️ OPERATIONAL

**Issue Location**: No webhook handler exists

**Problem**:
- Relying solely on client-side callback
- If user closes browser before redirect, no recovery
- No way to detect payment that succeeded on Paystack but failed locally
- No mechanism for handling disputes or refunds

**Professional Solution**:

```typescript
// /app/api/webhooks/paystack/route.ts
import { supabase } from '@/lib/supabase/server';
import crypto from 'crypto';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY!;

export async function POST(request: Request) {
  try {
    // 1. Verify webhook signature (critical for security)
    const hash = crypto
      .createHmac('sha512', PAYSTACK_SECRET)
      .update(await request.text())
      .digest('hex');

    const signature = request.headers.get('x-paystack-signature');
    if (hash !== signature) {
      return Response.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    const event = await request.json();

    // 2. Handle payment success event
    if (event.event === 'charge.success') {
      const { reference, amount, customer } = event.data;

      // Check if booking already exists
      const { data: existingBooking } = await supabase
        .from('bookings')
        .select('id')
        .eq('payment_reference', reference)
        .maybeSingle();

      if (existingBooking) {
        console.log('Payment already processed:', reference);
        return Response.json({ success: true });
      }

      // If no booking exists but payment succeeded,
      // this indicates client-side creation failed
      console.warn('Payment succeeded but no booking found:', reference);

      // Notify admin to manually create booking
      await notifyAdmin({
        type: 'ORPHANED_PAYMENT',
        payment_reference: reference,
        amount: amount / 100, // Paystack stores in cents
        customer_email: customer.email,
        timestamp: new Date(),
      });

      // Queue for manual intervention
      await supabase.from('failed_payments').insert({
        payment_reference: reference,
        amount: amount / 100,
        customer_email: customer.email,
        status: 'needs_review',
        webhook_received_at: new Date(),
      });
    }

    // 3. Handle dispute events
    if (event.event === 'charge.dispute.create') {
      const { reference, amount } = event.data;

      const { data: booking } = await supabase
        .from('bookings')
        .select('id, status')
        .eq('payment_reference', reference)
        .single();

      if (booking) {
        // Update booking status
        await supabase
          .from('bookings')
          .update({ status: 'disputed', payment_status: 'disputed' })
          .eq('id', booking.id);

        // Notify customer
        await notifyCustomer({
          type: 'PAYMENT_DISPUTED',
          booking_id: booking.id,
          timestamp: new Date(),
        });
      }
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

Configure in Paystack dashboard:
- Webhook URL: `https://yourdomain.com/api/webhooks/paystack`
- Events: `charge.success`, `charge.dispute.create`

**Why This Matters**:
- Recovery mechanism for failed client-side operations
- Handles payment disputes automatically
- Server-side verification separate from client
- Completes booking even if user closes browser

---

## Input Validation Issues

### 10. No Input Validation ⚠️ DATA QUALITY

**Issue Location**: Lines 22-26

**Problem**:
- `searchParams.get('data')` used directly without validation
- Malformed JSON crashes the page
- Invalid data reaches database
- No type checking before database operations

**Professional Solution**:

```typescript
// /lib/validation/booking-schema.ts
import { z } from 'zod';

export const BookingDataSchema = z.object({
  first_name: z.string().min(2).max(100),
  last_name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+27\d{9}$/), // South African format

  new_vehicle: z.object({
    brand: z.string().min(2),
    model: z.string().min(2),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    size_category: z.enum(['sedan', 'suv', 'bakkie', 'sports']),
    color: z.string().optional(),
    license_plate: z.string().regex(/^[A-Z]{2}\d{2}\s?[A-Z]{3}$/), // South African plate format
  }),

  saturday_date: z.string().date(), // YYYY-MM-DD
  time_slot: z.enum(['09:00', '11:00', '13:00']),
  slot_id: z.string().uuid(),

  service_type: z.enum(['maintenance_refresh', 'deep_clean', 'protection_package']),
  selected_addons: z.array(z.string().uuid()).optional(),

  address: z.string().min(5).max(500),
  suburb: z.string().min(2),
  city: z.string().min(2),
  postal_code: z.string().regex(/^\d{4}$/),
  gate_access_notes: z.string().max(500).optional(),
  special_requests: z.string().max(500).optional(),

  base_price: z.number().positive(),
  addon_price: z.number().nonnegative(),
  vat_amount: z.number().nonnegative(),
  grand_total: z.number().positive(),
});

export type BookingFormData = z.infer<typeof BookingDataSchema>;
```

Use in checkout:

```typescript
try {
  const rawData = JSON.parse(decodeURIComponent(dataParam));

  // Validate and throw if invalid
  const bookingData = BookingDataSchema.parse(rawData);

  setBookingData(bookingData);
} catch (error) {
  if (error instanceof z.ZodError) {
    console.error('Booking data validation failed:', error.errors);
    alert('Invalid booking data. Please start over.');
  } else {
    console.error('Error parsing booking data:', error);
  }
  router.push('/book');
}
```

**Why This Matters**:
- Prevents malformed data from reaching database
- Type safety throughout component
- Clear error messages for debugging
- Complies with OWASP validation guidelines

---

## Production Checklist

Use this checklist before deploying to production:

### Security
- [ ] Move booking data from URL params to session storage
- [ ] Implement server-side payment verification with Paystack secret key
- [ ] Add Content Security Policy (CSP) headers
- [ ] Enable HTTPS only
- [ ] Implement CSRF protection on API routes
- [ ] Validate all inputs with Zod schemas
- [ ] Hash sensitive data in logs (emails, amounts, references)
- [ ] Use secure random number generator for references
- [ ] Add rate limiting to payment verification endpoint

### Data Integrity
- [ ] Create database transaction (RPC) for booking creation
- [ ] Add unique constraint on `payment_reference`
- [ ] Implement idempotency checking
- [ ] Add database backup strategy
- [ ] Test rollback scenarios

### Authentication & Authorization
- [ ] Move authentication before checkout
- [ ] Verify user is authenticated in /api routes
- [ ] Add RLS policies to all tables
- [ ] Test user cannot access other users' data

### Error Handling & Monitoring
- [ ] Setup Sentry for error tracking
- [ ] Categorize errors (network vs. database vs. payment)
- [ ] Create support ticket on critical failures
- [ ] Implement retry logic with exponential backoff
- [ ] Add structured logging
- [ ] Test error scenarios (network timeout, DB error, payment failure)

### Compliance & Audit
- [ ] Implement payment audit logging (hashed data)
- [ ] Setup data retention policies
- [ ] Create GDPR data deletion function
- [ ] Document PCI-DSS compliance measures
- [ ] Setup webhook for Paystack events
- [ ] Test webhook signature verification

### User Experience
- [ ] Implement booking confirmation email via Resend
- [ ] Add 24-hour reminder SMS via Twilio
- [ ] Show booking confirmation page with reference
- [ ] Add booking status tracking in portal
- [ ] Test on mobile/slow networks
- [ ] Implement loading/disabled states
- [ ] Add helpful error messages to users

### Testing
- [ ] Unit tests for validation schemas
- [ ] Integration tests for payment flow (use Paystack test card)
- [ ] Load test payment endpoint (simulate concurrent bookings)
- [ ] Test error scenarios:
  - [ ] Network timeout during payment
  - [ ] Database constraint violation
  - [ ] Paystack verification fails
  - [ ] Double payment attempt
  - [ ] User closes browser before redirect
- [ ] Test on real devices (iOS/Android)
- [ ] Security audit by external party

### Operations
- [ ] Setup monitoring/alerts for failed bookings
- [ ] Create runbook for manual booking recovery
- [ ] Document refund process
- [ ] Setup customer support FAQ
- [ ] Create admin panel for payment management
- [ ] Implement payment reconciliation process

---

## Recommended Refactor

### Phase 1: Backend Infrastructure (Critical)

Move all payment handling to backend API route:

```
/app/api/bookings/checkout/route.ts
├── Receives validated booking data (from session, not URL)
├── Verifies payment with Paystack (using secret key)
├── Creates booking via atomic RPC
├── Sends confirmation email
├── Returns success response
└── Handles all errors server-side
```

### Phase 2: Authentication (Critical)

Restructure booking flow to require auth before checkout:

```
/app/book/page.tsx
├── Step 0: Login/Register (required)
├── Step 1: Vehicle Info
├── Step 2: Schedule
├── Step 3: Service
├── Step 4: Location
└── Step 5: Checkout (payment only)
```

### Phase 3: Security Hardening

- [ ] Implement session-based state management
- [ ] Add input validation for all forms
- [ ] Setup webhook for payment recovery
- [ ] Add fraud detection logic
- [ ] Implement rate limiting

### Phase 4: Compliance & Monitoring

- [ ] Audit logging for all payments
- [ ] Error tracking (Sentry)
- [ ] Email notifications
- [ ] Support ticket automation
- [ ] GDPR compliance functions

### Phase 5: UX Polish

- [ ] Better error messages
- [ ] Retry mechanisms
- [ ] Progress indicators
- [ ] Mobile optimization
- [ ] Accessibility improvements

---

## Summary of Changes Needed

| Issue | Severity | Impact | Effort |
|-------|----------|--------|--------|
| URL parameter data passing | Critical | Security breach | 2-3 hours |
| No payment verification | Critical | Fraudulent bookings | 2-3 hours |
| User creation during payment | High | Race conditions | 4-6 hours |
| No database transactions | High | Data loss risk | 3-4 hours |
| Inadequate error handling | High | Blind to failures | 3-4 hours |
| No idempotency | Medium | Duplicate bookings | 1-2 hours |
| No compliance logging | High | Regulatory risk | 3-4 hours |
| Missing notifications | Medium | Bad UX | 2-3 hours |
| No input validation | Medium | Data corruption | 2-3 hours |
| No webhook handler | Medium | Payment recovery | 2-3 hours |

**Estimated Total Effort**: 25-35 hours for full production-ready implementation

---

## References

- [PCI-DSS Compliance Guide](https://www.pcisecuritystandards.org/)
- [Paystack Documentation](https://paystack.com/docs/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Zod Validation Library](https://zod.dev/)
- [Sentry Error Tracking](https://sentry.io/)

