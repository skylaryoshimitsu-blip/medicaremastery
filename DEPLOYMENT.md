# Medicare Mastery - Deployment Guide

This guide explains how to deploy the unified authentication and payment system across both domains.

## Overview

The Medicare Mastery platform consists of two applications:

1. **Marketing Site** (`medicaremastery.app`) - Landing page, signup, and payment processing
2. **Program App** (`app.medicaremastery.app`) - Protected dashboard for enrolled students

Both applications use the **same Supabase project** to share authentication sessions and user data.

## Architecture

### Authentication Flow
1. User creates account on `medicaremastery.app`
2. User is redirected to Stripe Checkout
3. After successful payment, Stripe webhook creates entitlement record
4. User is redirected back to `medicaremastery.app/success`
5. Success page polls for entitlement confirmation
6. Once confirmed, user is automatically redirected to `app.medicaremastery.app`

### Access Control
- **Entitlements Table**: Server-authoritative access control
- **RLS Policies**: Users can only read their own entitlement data
- **Route Protection**: Program app checks for valid session AND active entitlement

## Deployment Steps

### 1. Configure Supabase

The following tables are already created via migrations:
- `user_profiles` - Extended user information
- `enrollments` - Enrollment tracking
- `entitlements` - Payment-gated access control

### 2. Configure Stripe Webhook

Set up a Stripe webhook endpoint to receive payment events:

**Webhook URL:**
```
https://[your-project-id].supabase.co/functions/v1/stripe-webhook
```

**Events to listen for:**
- `checkout.session.completed`

**Important:** The webhook function is configured with `verify_jwt: false` since it receives requests from Stripe, not authenticated users.

### 3. Environment Variables

Both applications need the same Supabase configuration:

```env
VITE_SUPABASE_URL=https://[your-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

For the Edge Functions (server-side), these are automatically available:
```env
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY
STRIPE_PRICE_ID
```

### 4. Deploy Marketing Site

The current application serves as the marketing site (`medicaremastery.app`):

```bash
npm run build
```

Deploy the `dist/` folder to your hosting provider configured for `medicaremastery.app`.

### 5. Deploy Program App

For the program app (`app.medicaremastery.app`), you need to:

**Option A: Separate Build**
1. Create a new build configuration that renders `ProtectedApp` as the root component
2. Deploy to a separate hosting instance configured for `app.medicaremastery.app`

**Option B: Same Codebase, Different Entry Points**
1. Use environment variables or routing to determine which app to render
2. Deploy the same build to both domains with different configurations

### 6. Cross-Domain Session Configuration

The Supabase client is configured to use `localStorage` with a custom storage key:

```typescript
storageKey: 'medicare-mastery-auth'
```

This ensures sessions persist across both subdomains. The browser's same-origin policy allows subdomains to share localStorage for the parent domain.

## Security Considerations

### Row Level Security (RLS)

All tables have RLS enabled with restrictive policies:

**Entitlements:**
- Users can only SELECT their own records
- Only service role (webhooks) can INSERT/UPDATE

**User Profiles:**
- Users can read their own profile
- Users can update their own profile

**Enrollments:**
- Users can read their own enrollment
- Service role can update payment status

### Access Verification

The program app verifies access on EVERY page load:
1. Check for authenticated user session
2. Query entitlements table for current user
3. Verify `has_active_access = true` AND `payment_verified = true`
4. If any check fails, redirect to appropriate page

## Testing

### Test the Complete Flow

1. **Signup:**
   - Go to `medicaremastery.app`
   - Create a new account
   - Verify you're redirected to Stripe Checkout

2. **Payment:**
   - Complete payment on Stripe
   - Verify you're redirected to `/success`
   - Wait for entitlement verification

3. **Redirect:**
   - Verify automatic redirect to `app.medicaremastery.app`
   - Confirm dashboard loads without re-authentication

4. **Access Control:**
   - Try accessing `app.medicaremastery.app` directly without payment
   - Verify redirect to pricing page

### Test Webhook

Use Stripe CLI to test webhook locally:

```bash
stripe listen --forward-to https://[your-project-id].supabase.co/functions/v1/stripe-webhook
stripe trigger checkout.session.completed
```

## Troubleshooting

### User Not Redirected After Payment

Check:
1. Stripe webhook is configured and receiving events
2. Webhook successfully creates entitlement record
3. Success page is polling correctly
4. No browser console errors

### Session Not Persisting Across Domains

Check:
1. Both apps use the same Supabase project
2. Both apps use the same `storageKey` configuration
3. Browser allows localStorage access
4. No conflicting authentication state

### Access Denied After Payment

Check:
1. Entitlement record exists for user
2. `has_active_access` and `payment_verified` are both `true`
3. RLS policies allow user to read their own entitlement
4. No caching issues (try hard refresh)

## Support

For issues or questions, contact the development team.
