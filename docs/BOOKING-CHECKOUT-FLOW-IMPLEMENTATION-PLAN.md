# Booking/Checkout Sequence Flow Update Plan

## Overview

Transform the current insecure booking flow into a production-ready system with:
- **Step 0 Authentication** - Magic link auth BEFORE booking data collection
- **Reusable Components** - Generic AuthGate and DynamicCheckout for use across projects
- **Server-side Security** - Payment verification and atomic booking creation
- **Session Persistence** - Long-lived sessions (weeks) for seamless returning user experience

## Current State Problems

### Critical Security Issues
1. **URL Parameter Data** - Booking data passed via query string (insecure, size-limited ~2KB)
2. **No Payment Verification** - Client-side callback trusted without server verification
3. **Auth After Payment** - User created after payment succeeds (lines 93-135 in checkout/page.tsx)
4. **Sequential DB Operations** - No atomic transactions, can fail mid-process leaving orphaned payments
5. **RLS Policy Issues** - Creating records without proper auth.uid() context

### Current Flow
```
/book (4 steps) → /book/checkout?data=JSON → Pay → Create user → Insert records → Success
```

---

## New Architecture

### Secure Flow
```
/book → Check auth → [No session] /book/auth (Step 0 - magic link)
                   → [Has session] Step 1-4 (Vehicle → Schedule → Service → Location)

Steps 1-4 → Collect data (sessionStorage) → Review screen

Review → POST to /api/bookings/create (with auth token)
      → Returns booking_id (status: pending)
      → Load checkout with booking_id

Checkout → Initialize payment → On success → POST to /api/bookings/verify

/api/bookings/verify → Server-side Paystack verification
                    → Atomic update (pending → confirmed)
                    → Send notifications
                    → Success page
```

---

## Implementation Phases

### Phase 1: Reusable Auth Component (Priority: CRITICAL)

#### 1.1 Create Generic AuthGate Component

**File**: `/components/reusable/auth/AuthGate.tsx`

**Features**:
- Provider-agnostic through adapter pattern
- Supabase (fully implemented), extensible for other providers
- Magic link support
- Terms & Conditions checkbox integration
- Session persistence checking
- Mobile-responsive with loading states

**Configuration Interface**:
```typescript
interface AuthGateConfig {
  provider: 'supabase' | 'custom';
  authAdapter: AuthAdapter;
  title?: string;
  subtitle?: string;
  redirectOnSuccess?: string;
  requireTerms?: boolean;
  termsUrl?: string;
  theme?: AuthTheme;
  onSuccess?: (user: any) => void;
}
```

**Files to Create**:
- `/components/reusable/auth/AuthGate.tsx` - Main component
- `/components/reusable/auth/adapters/SupabaseAuthAdapter.ts` - Supabase implementation
- `/components/reusable/auth/adapters/AuthAdapter.interface.ts` - Interface definition
- `/components/reusable/auth/components/EmailForm.tsx` - Email input UI
- `/components/reusable/auth/components/TermsCheckbox.tsx` - T&C checkbox with POPIA compliance

#### 1.2 Create Step 0 Auth Page

**File**: `/app/book/auth/page.tsx`

**Purpose**: Authentication gate before booking flow

**Implementation**:
```typescript
'use client';

import { AuthGate } from '@/components/reusable/auth/AuthGate';
import { SupabaseAuthAdapter } from '@/components/reusable/auth/adapters/SupabaseAuthAdapter';
import { supabase } from '@/lib/supabase/client';

export default function BookingAuthPage() {
  return (
    <AuthGate
      config={{
        provider: 'supabase',
        authAdapter: new SupabaseAuthAdapter(supabase),
        title: 'Welcome to Bespoke Car Preservation',
        subtitle: 'Sign in to book your premium service',
        redirectOnSuccess: '/book',
        requireTerms: true,
        termsUrl: '/terms',
        theme: {
          primaryColor: '#40E0FF',
          backgroundColor: '#07070A'
        }
      }}
    />
  );
}
```

#### 1.3 Update Booking Flow with Auth Check

**File**: `/app/book/page.tsx` (MODIFY)

**Changes**:
- Add session check on mount
- Redirect to `/book/auth` if no session
- Listen for auth state changes
- Pass user data to Step 4 (pre-fill email, phone, name)

**Implementation Pattern**:
```typescript
useEffect(() => {
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (!session) {
      router.push('/book/auth');
    } else {
      setSession(session);
      // Pre-fill user data from session
      setFormData(prev => ({
        ...prev,
        email: session.user.email,
        first_name: session.user.user_metadata.first_name,
        phone: session.user.user_metadata.phone
      }));
    }
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => setSession(session)
  );

  return () => subscription.unsubscribe();
}, []);
```

---

### Phase 2: Server-Side API Routes (Priority: CRITICAL)

#### 2.1 Create Booking Creation API

**File**: `/app/api/bookings/create/route.ts` (NEW)

**Purpose**: Server-side booking creation with authentication

**Flow**:
1. Validate auth token from header
2. Parse and validate booking data (use Zod)
3. Call atomic stored procedure
4. Return booking_id with status: pending

**Security**:
- Uses `SUPABASE_SERVICE_ROLE_KEY` for server operations
- Validates user owns the session
- Returns error if slot unavailable
- Implements rate limiting (optional but recommended)

**Response Format**:
```json
{
  "success": true,
  "booking_id": "uuid",
  "amount": 2500,
  "status": "pending"
}
```

#### 2.2 Create Payment Verification API

**File**: `/app/api/bookings/verify/route.ts` (NEW)

**Purpose**: Server-side Paystack payment verification

**Flow**:
1. Validate auth token
2. Get payment_reference and booking_id from request
3. Verify booking belongs to authenticated user
4. **Call Paystack verify API** with `PAYSTACK_SECRET_KEY`
5. Verify amount matches booking.grand_total
6. Update booking (pending → confirmed, payment_status → paid)
7. Trigger notifications (SMS, email)
8. Return success

**Critical Security**:
- NEVER trust client-side payment callbacks
- Always verify with Paystack server-to-server
- Check amount matches to prevent tampering
- Implement idempotency (check if already verified)

**Paystack Verification**:
```typescript
const response = await fetch(
  `https://api.paystack.co/transaction/verify/${reference}`,
  {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
    }
  }
);

const { data } = await response.json();
if (data.status !== 'success') throw new Error('Payment failed');
if (data.amount / 100 !== booking.grand_total) throw new Error('Amount mismatch');
```

---

### Phase 3: Database Stored Procedure (Priority: HIGH)

#### 3.1 Create Atomic Booking Function

**File**: `/lib/supabase/schema.sql` (ADD)

**Function**: `create_booking_atomic()`

**Purpose**: Atomic multi-table booking creation

**Operations** (in single transaction):
1. Check slot availability (throw if full)
2. Create or find vehicle
3. Insert booking (status: pending, payment_status: pending)
4. Insert booking_addons
5. Update slot capacity (via trigger)
6. Return booking_id

**Benefits**:
- All-or-nothing guarantee
- No orphaned payments
- Automatic rollback on any failure
- Slot availability race condition prevention

**SQL Signature**:
```sql
CREATE OR REPLACE FUNCTION create_booking_atomic(
  p_user_id UUID,
  p_vehicle_data JSONB,
  p_booking_data JSONB,
  p_addon_ids UUID[]
)
RETURNS JSONB
```

**Error Handling**:
```sql
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Booking creation failed: %', SQLERRM;
```

---

### Phase 4: Generic Checkout Component (Priority: HIGH)

#### 4.1 Create Reusable DynamicCheckout

**File**: `/components/reusable/checkout/DynamicCheckout.tsx` (NEW)

**Features**:
- Payment provider abstraction (Paystack, Stripe, etc.)
- Configurable data display via schemas
- Built-in pricing breakdown
- Server-side verification flow
- Loading and error states
- Mobile-optimized

**Configuration Interface**:
```typescript
interface CheckoutConfig<TData = any> {
  paymentProvider: 'paystack' | 'stripe' | 'paddle' | 'custom';
  paymentAdapter: PaymentAdapter;
  bookingData: TData;
  dataSchema: CheckoutDataSchema;
  pricingCalculator: (data: TData) => PricingBreakdown;
  currency: string;
  createEndpoint: string;      // e.g. /api/bookings/create
  verifyEndpoint: string;      // e.g. /api/bookings/verify
  requireAuthentication: boolean;
  onSuccess: (bookingId: string) => void;
  onError: (error: Error) => void;
}
```

**Flow**:
1. Display booking summary (via dataSchema)
2. Show pricing breakdown
3. On "Pay" click → POST to createEndpoint
4. Get booking_id → Initialize payment with adapter
5. On payment success → POST to verifyEndpoint
6. Call onSuccess with booking_id

**Files to Create**:
- `/components/reusable/checkout/DynamicCheckout.tsx` - Main component
- `/components/reusable/checkout/components/PricingSummary.tsx` - Pricing display
- `/components/reusable/checkout/components/DataReview.tsx` - Booking review
- `/components/reusable/checkout/types.ts` - TypeScript definitions

#### 4.2 Create Payment Adapters

**File**: `/components/reusable/checkout/adapters/PaystackAdapter.ts` (NEW)

**Interface**: `PaymentAdapter`

**Methods**:
- `initialize()` - Load payment scripts
- `createPayment(amount, metadata)` - Generate payment intent
- `handleCallback(callbacks)` - Handle payment flow
- `verifyPayment(reference)` - Server-side only (throws error client-side)

**Paystack Implementation**:
```typescript
export class PaystackAdapter implements PaymentAdapter {
  async createPayment(amount: number, metadata: any): Promise<PaymentIntent> {
    await loadPaystackScript();
    const reference = generateReference();
    return { reference, amount, currency: 'ZAR', metadata };
  }

  async handleCallback(callbacks: {
    onSuccess: (reference: string) => void;
    onClose: () => void;
  }): Promise<PaymentResult> {
    return new Promise((resolve) => {
      initializePaystack({
        key: this.config.publicKey,
        amount: this.config.amount,
        reference: this.config.reference,
        onSuccess: (response) => {
          callbacks.onSuccess(response.reference);
          resolve({ success: true, reference: response.reference });
        },
        onClose: () => {
          callbacks.onClose();
          resolve({ success: false });
        }
      });
    });
  }
}
```

**Also Create** (templates for other projects):
- `/components/reusable/checkout/adapters/StripeAdapter.ts` - Stripe implementation template
- `/components/reusable/checkout/adapters/PaymentAdapter.interface.ts` - Interface definition

#### 4.3 Update Project Checkout Page

**File**: `/app/book/checkout/page.tsx` (REPLACE)

**Changes**:
- Remove all payment logic (move to API routes)
- Use `DynamicCheckout` component
- Get booking data from sessionStorage (not URL params)
- Configure with Paystack adapter
- Define checkout schema for car cleaning booking

**Implementation**:
```typescript
'use client';

import { DynamicCheckout } from '@/components/reusable/checkout/DynamicCheckout';
import { PaystackAdapter } from '@/components/reusable/checkout/adapters/PaystackAdapter';

export default function CheckoutPage() {
  const bookingData = JSON.parse(sessionStorage.getItem('booking_data'));
  const paymentAdapter = new PaystackAdapter({
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!
  });

  return (
    <DynamicCheckout
      config={{
        paymentProvider: 'paystack',
        paymentAdapter,
        bookingData,
        dataSchema: {
          sections: [
            {
              title: 'Vehicle Details',
              fields: [
                { label: 'Vehicle', value: `${bookingData.new_vehicle?.brand} ${bookingData.new_vehicle?.model}` },
                { label: 'License Plate', value: bookingData.new_vehicle?.license_plate }
              ]
            },
            {
              title: 'Service Details',
              fields: [
                { label: 'Date', value: bookingData.saturday_date, type: 'date' },
                { label: 'Time', value: bookingData.time_slot },
                { label: 'Service', value: bookingData.service_type }
              ]
            }
          ]
        },
        pricingCalculator: (data) => ({
          base: data.base_price,
          addons: data.addon_price,
          subtotal: data.total_price,
          tax: data.vat_amount,
          total: data.grand_total
        }),
        currency: 'ZAR',
        createEndpoint: '/api/bookings/create',
        verifyEndpoint: '/api/bookings/verify',
        requireAuthentication: true,
        onSuccess: (bookingId) => {
          sessionStorage.removeItem('booking_data');
          router.push(`/book/success?booking_id=${bookingId}`);
        }
      }}
    />
  );
}
```

---

### Phase 5: Session Management & Security (Priority: MEDIUM)

#### 5.1 Update Supabase Client Configuration

**File**: `/lib/supabase/client.ts` (MODIFY)

**Changes**:
- Enable persistent sessions (localStorage)
- Enable auto token refresh
- Use PKCE flow for better security
- Add helper for getting access token

**Configuration**:
```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce'
  }
});

export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
}
```

#### 5.2 Configure Session Duration

**In Supabase Dashboard** → Authentication → Settings:
- JWT expiry: **604800 seconds (7 days)**
- Refresh token expiry: **2592000 seconds (30 days)**
- Enable email confirmations: **No** (magic links don't need confirmation)
- Secure email change: **Yes**

**Result**: Users stay logged in for weeks, no repeated magic links

---

### Phase 6: Documentation for Reusability (Priority: LOW)

#### 6.1 Create Comprehensive README

**File**: `/components/reusable/README.md` (NEW)

**Contents**:
1. **Overview** - What these components do
2. **AuthGate Usage** - Examples for Supabase implementation, extensible for custom providers
3. **DynamicCheckout Usage** - Examples for e-commerce, appointments, bookings
4. **Creating Custom Adapters** - Interface implementation guides
5. **Integration Checklist** - Step-by-step for new projects
6. **Configuration Examples** - Different use cases
7. **Security Best Practices** - PCI-DSS, OWASP compliance
8. **Testing Strategies** - Unit and integration test examples
9. **Troubleshooting** - Common issues and solutions

#### 6.2 Add Inline Code Documentation

**All reusable components should have**:
- JSDoc comments on interfaces
- Usage examples in file headers
- Prop descriptions
- Type documentation

---

## Critical File Changes Summary

### New Files (19)

**Auth System**:
- `/app/book/auth/page.tsx` - Step 0 authentication page
- `/components/reusable/auth/AuthGate.tsx` - Universal auth component
- `/components/reusable/auth/adapters/SupabaseAuthAdapter.ts` - Supabase integration
- `/components/reusable/auth/adapters/AuthAdapter.interface.ts` - Adapter interface
- `/components/reusable/auth/components/EmailForm.tsx` - Email input UI
- `/components/reusable/auth/components/TermsCheckbox.tsx` - T&C checkbox

**Checkout System**:
- `/components/reusable/checkout/DynamicCheckout.tsx` - Universal checkout
- `/components/reusable/checkout/adapters/PaystackAdapter.ts` - Paystack integration
- `/components/reusable/checkout/adapters/StripeAdapter.ts` - Stripe template
- `/components/reusable/checkout/adapters/PaymentAdapter.interface.ts` - Adapter interface
- `/components/reusable/checkout/components/PricingSummary.tsx` - Pricing display
- `/components/reusable/checkout/components/DataReview.tsx` - Booking review
- `/components/reusable/checkout/types.ts` - TypeScript types

**API Routes**:
- `/app/api/bookings/create/route.ts` - Server-side booking creation
- `/app/api/bookings/verify/route.ts` - Server-side payment verification

**Documentation**:
- `/components/reusable/README.md` - Complete usage guide
- `/docs/CHECKOUT-PRODUCTION-STANDARDS.md` - Already exists (security audit)

**Database**:
- Add `create_booking_atomic()` function to `/lib/supabase/schema.sql`

**Utilities**:
- `/lib/utils/getAccessToken.ts` - Helper for API calls (or add to client.ts)

### Modified Files (3)

- `/app/book/page.tsx` - Add auth check, redirect to /book/auth if no session
- `/app/book/checkout/page.tsx` - Replace with DynamicCheckout usage
- `/lib/supabase/client.ts` - Update auth config for persistent sessions

---

## Testing Strategy

### Unit Tests
- AuthGate component rendering
- Auth adapter methods (signIn, getSession, signOut)
- Payment adapter methods (createPayment, handleCallback)
- Pricing calculator functions
- Data schema validation

### Integration Tests
1. **Full Auth Flow**:
   - Visit /book → Redirect to /book/auth
   - Enter email → Magic link sent
   - Click link → Session created → Redirect to /book
   - Refresh page → Session persists → No login required

2. **Full Booking Flow**:
   - Authenticated user completes Steps 1-4
   - Review screen shows correct data
   - Click checkout → API creates pending booking
   - Payment succeeds → Verification succeeds
   - Booking status updated to confirmed
   - Redirect to success page

3. **Security Tests**:
   - Unauthenticated API calls rejected (401)
   - Payment verification without valid token fails
   - Amount tampering detected
   - Idempotency: duplicate payment_reference handled
   - RLS policies enforced

### Manual Testing Checklist
- [ ] New user signup flow
- [ ] Returning user (session persists)
- [ ] Payment with Paystack test card: 5200828282828210
- [ ] Verify booking created in database
- [ ] Check email/SMS notifications sent
- [ ] Test on mobile device
- [ ] Test with slow network (3G throttling)
- [ ] Test payment cancellation
- [ ] Test slot unavailable scenario

---

## Environment Variables Required

```env
# Supabase (existing)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...  # NEW - for API routes

# Paystack (existing)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxx
PAYSTACK_SECRET_KEY=sk_live_xxx  # NEW - for payment verification

# App Configuration (existing)
NEXT_PUBLIC_APP_URL=https://carpreservation.co.za

# Session Configuration (configure in Supabase Dashboard)
JWT_EXPIRY_SECONDS=604800  # 7 days
REFRESH_TOKEN_EXPIRY_SECONDS=2592000  # 30 days
```

---

## Migration Steps (Deployment)

### Pre-Deployment
1. Backup current database
2. Test all changes in development
3. Run integration tests
4. Review security checklist

### Deployment Sequence
1. **Database First**: Deploy stored procedure via Supabase SQL Editor
2. **API Routes**: Deploy Next.js app (includes new API routes)
3. **Frontend**: Already deployed with app
4. **Test**: Run smoke tests on production
5. **Monitor**: Watch error logs for first 24 hours

### Rollback Plan
If issues occur:
1. Revert Next.js deployment (Vercel instant rollback)
2. Database function can coexist with old code (not breaking)
3. Old checkout page can be restored from git

---

## Success Criteria

### Functional Requirements
- ✅ Users must authenticate before booking (Step 0)
- ✅ Returning users stay logged in for weeks
- ✅ Payment verified server-side with Paystack
- ✅ Booking creation is atomic (no partial records)
- ✅ Components are reusable in other projects

### Security Requirements
- ✅ No sensitive data in URL parameters
- ✅ Payment verification server-side only
- ✅ Auth token required for all API calls
- ✅ RLS policies enforced
- ✅ Amount tampering detected

### Performance Requirements
- ✅ Auth check < 200ms
- ✅ Booking creation < 500ms
- ✅ Payment verification < 1000ms
- ✅ Total checkout flow < 5 seconds

### User Experience Requirements
- ✅ Mobile-responsive auth and checkout
- ✅ Clear loading states
- ✅ Helpful error messages
- ✅ Session persists across devices (email-based)
- ✅ Quick rebook for returning customers (future enhancement)

---

## Future Enhancements (Post-MVP)

1. **Quick Rebook** - One-click rebooking for returning customers
2. **Webhook Integration** - Paystack webhook for payment recovery
3. **Social Auth** - Google/Facebook sign-in options
4. **Guest Checkout** - Optional guest mode with email-only
5. **Stripe Adapter** - Complete Stripe integration
6. **Payment Methods** - Card-on-file, wallet, bank transfer
7. **Multi-currency** - Support USD, EUR, etc.
8. **Installment Payments** - Split payments over time
9. **Referral Integration** - Apply referral credits at checkout
10. **Custom Auth Adapters** - Templates for other providers if needed

---

## Implementation Scope (User Confirmed)

### What We're Implementing
✅ **Paystack adapter only** (fully working) - Stripe as template/documentation only
✅ **Supabase auth only** (fully working) - Extensible interface for custom implementations
✅ **Manual testing** checklist - No automated tests in this phase
✅ **Core functionality** only - No future enhancements

### What's Excluded (For Later)
❌ Stripe payment adapter (template provided)
❌ Other auth providers (interface provided for extensibility)
❌ Automated test suite (can be added later)
❌ Webhook integration, quick rebook, social auth

## Estimated Effort (Revised)

### By Phase
- **Phase 1 (Auth - Supabase only)**: 6-8 hours
- **Phase 2 (API Routes)**: 6-8 hours
- **Phase 3 (Database)**: 3-4 hours
- **Phase 4 (Checkout - Paystack only)**: 6-8 hours
- **Phase 5 (Session)**: 2-3 hours
- **Phase 6 (Documentation - templates only)**: 3-4 hours

**Total**: 26-35 hours (3-4 working days)

### By Priority
- **Critical** (Auth + API + DB): 15-20 hours (2 days)
- **High** (Checkout): 6-8 hours (1 day)
- **Medium** (Session): 2-3 hours (0.5 day)
- **Low** (Documentation): 3-4 hours (0.5 day)

---

## Risks & Mitigations

### Risk: Session Expiry During Booking
**Mitigation**: Implement token refresh in background, show modal if session lost

### Risk: Payment Succeeds but Verification Fails
**Mitigation**: Webhook fallback (future), manual reconciliation process, support ticket creation

### Risk: Slot Fully Booked Between Steps
**Mitigation**: Stored procedure checks availability atomically, show helpful error message

### Risk: User Abandons After Auth
**Mitigation**: Send reminder email, track funnel drop-off, optimize flow

### Risk: Reusable Components Too Generic
**Mitigation**: Start with working car cleaning implementation, extract patterns, add configuration gradually

---

## References

- **Current Checkout Issues**: `/docs/CHECKOUT-PRODUCTION-STANDARDS.md`
- **Database Schema**: `/lib/supabase/schema.sql`
- **Existing Auth**: `/app/auth/login/page.tsx`
- **Booking Types**: `/types/index.ts`
- **Paystack Docs**: https://paystack.com/docs/api/#verification
- **Supabase Auth**: https://supabase.com/docs/guides/auth
- **POPIA Compliance**: South African data protection requirements
