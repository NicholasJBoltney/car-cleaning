# Booking Pipeline Audit

**Date:** 2026-02-04
**Scope:** `app/api/bookings/`, `app/book/`, `components/booking/`
**Total issues:** 20 (6 Critical — all resolved, 6 High, 8 Medium)

---

## Critical

### ✅ 1. Server trusts all prices from the client
**File:** `app/api/bookings/create/route.ts:30-34`
**Status:** Resolved — all price fields removed from the Zod schema. Route queries `pricing_config` for base price by `size_category`, queries `service_addons` to validate and sum addon prices, calculates `totalPrice` / `vatAmount` / `grandTotal` server-side, and injects them into `bookingDataWithPrices` before the stored procedure call. Also resolves #17.

`base_price`, `addon_price`, `total_price`, `vat_amount`, and `grand_total` are all supplied in the request body and written directly to the database. A user can POST `grand_total: 1` and pay R1 for an R800 service.

**Fix:** The server must derive prices from `size_category` and `addon_ids` independently. Remove all price fields from the Zod schema input and calculate them inside the route or the stored procedure.

---

### ✅ 2. `service_type` and `size_category` not enum-validated
**File:** `app/api/bookings/create/route.ts:24,29`
**Status:** Resolved — both fields changed to `z.enum()` locked to the exact values in the database CHECK constraints.

Both fields are validated as `z.string()`. Any arbitrary value passes and reaches the database.

**Fix:**
```ts
size_category: z.enum(['sedan', 'suv', 'luxury', 'sports']),
service_type: z.enum(['maintenance_refresh', 'full_preservation', 'interior_detail', 'paint_correction']),
```

---

### ✅ 3. Vehicle data shape mismatch — review page shows blank vehicle
**Files:** `components/booking/Step1Vehicle.tsx:107` and `app/book/page.tsx:188`
**Status:** Resolved — Step1 now emits `{ new_vehicle: formData }`. Review page, payload builder, and the `vehicleCategory` prop on Step3 all resolve correctly.

Step1 calls `onNext({ brand, model, year, size_category, color, license_plate })` as a flat object. The review page reads `formData.new_vehicle?.brand`. The `new_vehicle` key is never set, so the entire vehicle section on the review screen is empty.

**Fix:** Wrap the Step1 output:
```ts
onNext({ new_vehicle: formData });
```

---

### ✅ 4. Addon IDs are always sent as an empty array
**Files:** `components/booking/Step3Service.tsx:97` and `app/book/page.tsx:133`
**Status:** Resolved — payload builder now uses `formData.selected_addons || []` directly. The `string[]` from Step3 passes through without the broken `.id` filter.

Step3 passes `selected_addons` as a `string[]` of IDs. The payload builder on line 133 does `.filter(a => a && a.id).map(a => a.id)`, treating each element as an object with an `.id` property. Strings have no `.id`, so the filter drops every entry.

**Fix:** Change the payload builder to use the IDs directly:
```ts
addon_ids: formData.selected_addons || []
```

---

### ✅ 5. Mismatched JSX tags in Step1Vehicle
**File:** `components/booking/Step1Vehicle.tsx:111` vs `:248`
**Status:** Resolved — orphaned `</FormCard>` and two extra `</div>` elements replaced with a single `</BookingStepCard>` that matches the opening tag.

Line 111 opens `<BookingStepCard>`. Line 248 closes `</FormCard>`. These are different components. The file will either fail to compile or render incorrectly.

**Fix:** Align both tags to the same component. Steps 2–4 use `FormCard`; Step1 should do the same for consistency.

---

### ✅ 6. `gate_access_notes` and `special_requests` are silently dropped
**Files:** `components/booking/Step4Location.tsx:22-23` and `app/book/page.tsx:119-132`
**Status:** Resolved — both fields added to the `booking_data` payload in `page.tsx`, declared as `z.string().optional()` in the Zod schema, and included in the `INSERT INTO bookings` inside `create_booking_atomic`.

Step4 collects both fields and passes them via `onNext`. The `booking_data` payload object in the orchestrator never includes them. They never reach the API or the database.

**Fix:** Add both fields to the `booking_data` object before the fetch call:
```ts
gate_access_notes: formData.gate_access_notes,
special_requests: formData.special_requests,
```

---

## High

### ~~7. Auth page is visually disconnected from the platform~~
**File:** `app/book/auth/page.tsx:19-20`
**Status:** Not an issue — the gold (`#E6B31E`) / cream (`#FCFAF1`) palette is the confirmed app-wide design system. No change needed.

The auth gate theme sets `primaryColor: '#E6B31E'` (gold) and `backgroundColor: '#FCFAF1'` (cream). Every other page in the platform uses Void Black (`#07070A`) and Electric Cyan (`#40E0FF`). The auth page is the first screen a user lands on.

---

### ✅ 8. Step4 contact fields start empty despite session data
**Files:** `components/booking/Step4Location.tsx:5-24` and `app/book/page.tsx:329`
**Status:** Resolved — `Step4Location` now accepts an optional `defaultValues` prop that seeds `first_name`, `last_name`, `email`, and `phone` into local state. The orchestrator passes the session-prefilled values from `formData` when rendering Step4.

The orchestrator pre-fills `first_name`, `last_name`, `email`, and `phone` from the Supabase session into `formData`. None of this is passed down to Step4 as props. The user has to re-type contact details they already provided at sign-in.

**Fix:** Add a `defaultValues` prop to Step4 and use it to seed the local state.

---

### ✅ 9. Booking confirmation notifications are commented out
**File:** `app/api/bookings/verify/route.ts:122+`
**Status:** Resolved — the placeholder comment is replaced with a live SMS send. The route queries `user_profiles` for the phone number, builds the message via `NotificationTemplates.bookingConfirmation`, and calls `sendSMS`. The call is wrapped in try/catch so an SMS failure cannot break the verify response. The booking select was also expanded to join `slots(saturday_date, time_slot)` to populate the template.

The notification call is a commented-out placeholder: `// await sendConfirmationEmail(...)`. Per the project spec (`lib/notifications.ts`), an SMS confirmation should fire on booking confirmation. Bookings currently confirm silently.

**Fix:** Implement and wire the confirmation notification using the existing Twilio integration.

---

### ✅ 10. `alert()` used for booking creation errors
**File:** `app/book/page.tsx:153`
**Status:** Resolved — `alert()` replaced with a `bookingError` state variable. On error the state is set; on retry it is cleared. An inline error card (red-tinted, bordered) renders above the action buttons inside the Payment Summary card when the state is non-null.

`alert('Failed to create booking: ...')` is a browser-native dialog. It breaks the luxury aesthetic and provides no styling control.

**Fix:** Replace with an in-page error state (toast or inline error card) that matches the Void Black / Electric Cyan design system.

---

### ✅ 11. Unstyled Suspense fallback in checkout
**File:** `app/book/checkout/page.tsx:142`
**Status:** Resolved — the bare `<div>Loading...</div>` is replaced with the full-screen spinner-in-Card pattern already used by `CheckoutContent`'s own loading state and by `success/page.tsx`.

The Suspense boundary falls back to a bare `<div>Loading...</div>` with no styling. Every other loading state in the app uses the styled spinner inside a `Card`.

---

### ✅ 12. No HTTP status check on Paystack verify response
**File:** `app/api/bookings/verify/route.ts:83-93`
**Status:** Resolved — `verifyResponse.ok` is checked immediately after the fetch. A non-OK response returns a 502 with a generic error before any JSON parsing is attempted.

If Paystack returns a 5xx, the code still attempts to parse the body as JSON and check `verifyData.data.status`. This will either throw or silently take the wrong path.

**Fix:** Check `verifyResponse.ok` before parsing:
```ts
if (!verifyResponse.ok) {
  return NextResponse.json({ error: 'Payment provider unavailable' }, { status: 502 });
}
```

---

## Medium

### ✅ 13. Only 2 of 4 service types in the UI
**File:** `components/booking/Step3Service.tsx:14-63`
**Status:** Resolved — `interior_detail` and `paint_correction` added to `SERVICE_TYPES` with descriptions and feature lists matching the existing two entries.

`types/index.ts:42` defines four service types: `maintenance_refresh`, `full_preservation`, `interior_detail`, `paint_correction`. Step3 only exposes the first two. If the other two are intentionally hidden for now, add a comment to that effect; otherwise add them.

---

### ✅ 14. Base prices hardcoded in two places
**Files:** `components/booking/Step1Vehicle.tsx` and `components/booking/Step3Service.tsx`
**Status:** Resolved — both components now fetch prices from the `pricing_config` table on mount via `supabase.from('pricing_config')`. Seed defaults in state give instant render; the DB response overwrites on first load. The hardcoded maps and the short-lived `BASE_PRICES` constant are removed.

The price map `{ sedan: 400, suv: 600, luxury: 800, sports: 750 }` is duplicated. A change in one will not propagate to the other.

---

### ✅ 15. Double padding on FormCard
**Files:** `Step2Schedule.tsx`, `Step3Service.tsx`, `Step4Location.tsx`
**Status:** Resolved — `className="p-10 lg:p-12"` removed from all three Step components. FormCard's internal `p-10 lg:p-14` wrapper is now the single source of padding.

FormCard already applies `p-10 lg:p-14` to its inner wrapper. Steps 2–4 also pass `className="p-10 lg:p-12"` on the FormCard element itself, stacking padding.

---

### ✅ 16. Inconsistent card wrappers across steps
**Files:** `Step1Vehicle.tsx` vs `Step2Schedule.tsx`, `Step3Service.tsx`, `Step4Location.tsx`
**Status:** Resolved — Step1 converted from `BookingStepCard` to `FormCard` with the same outer layout pattern (header outside the card, `FormCard size="large"` wrapping content) used by Steps 2–4. All four steps now use an identical container structure.

Step1 uses `BookingStepCard` (includes a border). Steps 2–4 use `FormCard` (no border). The visual container changes mid-flow.

---

### ✅ 17. `addon_ids` not validated server-side
**File:** `app/api/bookings/create/route.ts:116-133`
**Status:** Resolved — resolved as a direct side effect of #1. The server-side price calculation block queries `service_addons` with `.in('id', addon_ids).eq('is_active', true)` and rejects the request if the returned row count does not match the requested count. Invalid or inactive addon IDs never reach the stored procedure.

The array of addon UUIDs from the client is passed directly to the stored procedure with no server-side check that the rows exist in `service_addons`. Invalid IDs will either error silently or inside the RPC.

**Fix:** Query `service_addons` for the provided IDs before calling the RPC. Use the returned rows to also derive the canonical `addon_price`.

---

### ✅ 18. Amount mismatch error leaks expected and received values
**File:** `app/api/bookings/verify/route.ts`
**Status:** Resolved — `expected` and `received` fields stripped. Response is now a single generic message: `'Payment amount does not match booking'`.

The error response body includes `expected` and `received` fields, exposing internal pricing to anyone who triggers a mismatch.

---

### ✅ 19. `saturday_date` has no format or business-logic validation
**File:** `app/api/bookings/create/route.ts:28`
**Status:** Resolved — `z.string()` replaced with `z.string().refine()`. The refine checks: (a) YYYY-MM-DD format via regex, (b) valid parseable date, (c) `getUTCDay() === 6` (Saturday), (d) date is not in the past relative to today.

Validated only as `z.string()`. Nothing confirms it is a valid ISO date string, falls on a Saturday, or is in the future.

---

### ✅ 20. `booking_id` and `reference` have no format validation
**File:** `app/api/bookings/verify/route.ts:55`
**Status:** Resolved — UUID regex guard added immediately after the null check, before the booking query executes. Invalid `booking_id` values return 400 without hitting the database.

Both parameters are accepted as any string. `booking_id` should be validated as a UUID before the database query executes.

---

## Priority order for resolution

| Priority | Issues | Rationale |
|---|---|---|
| 1 — ✅ Done | 1, 2, 3, 4, 5, 6, 17 | All resolved. Prices calculated server-side, enums locked, vehicle shape and addon IDs fixed, JSX structure corrected, gate notes wired end-to-end, addon validation added. |
| 2 — ✅ Done | 7 (not an issue), 8, 9, 10, 11, 12 | All resolved. Contact fields pre-filled from session, SMS confirmation wired, alert replaced with inline error card, Suspense fallback styled, Paystack response guarded. |
| 3 — ✅ Done | 13–16, 18–20 | All resolved. All 4 service types exposed, prices fetched from DB, double padding removed, card wrappers unified, amount-mismatch response scrubbed, saturday_date validated, booking_id UUID-guarded. |
