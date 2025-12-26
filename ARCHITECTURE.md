# Medicare Mastery - System Architecture

## Overview

This document provides a comprehensive overview of the unified authentication, payment, and access control system across the Medicare Mastery platform.

## System Components

### 1. Frontend Applications

#### Marketing Site (`medicaremastery.app`)
- **Purpose**: Landing page, user registration, and payment initiation
- **Key Components**:
  - `AuthModal.tsx`: Handles signup and login
  - `SuccessPage.tsx`: Payment confirmation and redirect orchestration
  - Landing page components (Hero, Features, etc.)

#### Program App (`app.medicaremastery.app`)
- **Purpose**: Protected dashboard for enrolled students
- **Key Components**:
  - `ProtectedApp.tsx`: Route guard with entitlement verification
  - `ProgramDashboard.tsx`: Main dashboard interface

### 2. Backend Services

#### Supabase
- **Authentication**: Email/password with session management
- **Database**: PostgreSQL with Row Level Security
- **Edge Functions**: Serverless functions for Stripe integration

#### Stripe
- **Checkout Sessions**: Secure payment processing
- **Webhooks**: Payment event notifications

## Data Flow

### User Signup and Payment Flow

```
1. User visits medicaremastery.app
   ↓
2. User fills signup form in AuthModal
   ↓
3. AuthContext.signUp() creates:
   - Auth user account (auth.users)
   - User profile (user_profiles)
   - Enrollment record (enrollments)
   ↓
4. Frontend calls create-checkout-session Edge Function
   - Passes userId and email
   - Function creates Stripe Checkout Session with client_reference_id
   ↓
5. User redirected to Stripe Checkout
   ↓
6. User completes payment on Stripe
   ↓
7. Stripe sends webhook to stripe-webhook Edge Function
   - Event: checkout.session.completed
   - Webhook creates/updates entitlement record
   - Sets has_active_access = true, payment_verified = true
   ↓
8. User redirected to medicaremastery.app/success
   ↓
9. SuccessPage polls entitlements table
   - Checks every 2 seconds for up to 60 seconds
   - Waits for has_active_access = true AND payment_verified = true
   ↓
10. Once verified, automatic redirect to app.medicaremastery.app
    ↓
11. ProtectedApp component verifies access
    - Checks for authenticated session
    - Queries entitlements table
    - Verifies active access
    ↓
12. Dashboard loads if all checks pass
```

### Session Persistence

Both applications use the same Supabase client configuration:

```typescript
createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.localStorage,
    storageKey: 'medicare-mastery-auth',
    persistSession: true,
    autoRefreshToken: true,
  }
})
```

Since both domains share the parent domain `medicaremastery.app`, localStorage is accessible across subdomains, enabling seamless session continuity.

## Database Schema

### auth.users (Managed by Supabase)
- `id` (UUID): Primary key
- `email`: User email address
- `encrypted_password`: Hashed password
- `created_at`: Account creation timestamp

### user_profiles
```sql
- id (UUID): Foreign key to auth.users.id
- full_name (TEXT): User's full name
- phone (TEXT): User's phone number
- created_at (TIMESTAMPTZ): Profile creation timestamp
- updated_at (TIMESTAMPTZ): Last update timestamp
```

**RLS Policies**:
- Users can SELECT their own profile
- Users can UPDATE their own profile

### enrollments
```sql
- id (UUID): Primary key
- user_id (UUID): Foreign key to auth.users.id
- email (TEXT): User email
- enrollment_status ('unpaid' | 'paid'): Payment status
- program_access ('locked' | 'unlocked'): Access status
- payment_amount (NUMERIC): Payment amount
- payment_confirmed_at (TIMESTAMPTZ): Payment confirmation time
- payment_method (TEXT): Payment method used
- created_at (TIMESTAMPTZ): Enrollment creation timestamp
```

**RLS Policies**:
- Users can SELECT their own enrollment
- Service role can UPDATE enrollments

### entitlements
```sql
- id (UUID): Primary key
- user_id (UUID): Foreign key to auth.users.id, UNIQUE
- has_active_access (BOOLEAN): Active access flag
- payment_verified (BOOLEAN): Payment verification flag
- stripe_payment_intent_id (TEXT): Stripe payment intent ID
- stripe_customer_id (TEXT): Stripe customer ID
- created_at (TIMESTAMPTZ): Creation timestamp
- updated_at (TIMESTAMPTZ): Last update timestamp
- expires_at (TIMESTAMPTZ): Optional expiration date
```

**RLS Policies**:
- Users can SELECT their own entitlement
- Service role can INSERT/UPDATE entitlements

## Security Model

### Authentication
- Email/password authentication via Supabase Auth
- Sessions stored in localStorage with custom key
- Automatic token refresh
- Session persistence across page reloads

### Authorization
- **Server-Authoritative**: Access control based on database records
- **Row Level Security**: Database-level access restrictions
- **Entitlement-Based**: Access tied to payment verification
- **Frontend Validation**: Route guards check entitlement status

### Security Principles
1. **Never trust the client**: All access decisions verified server-side
2. **Principle of least privilege**: Users can only access their own data
3. **Defense in depth**: Multiple layers of security checks
4. **Secure by default**: RLS enabled on all tables

## Edge Functions

### create-checkout-session
**Purpose**: Create Stripe Checkout Session with user context

**Input**:
```typescript
{
  userId: string,
  userEmail: string
}
```

**Process**:
1. Validate input parameters
2. Create Stripe Checkout Session
3. Set `client_reference_id` to userId
4. Configure success/cancel URLs

**Output**:
```typescript
{
  sessionId: string,
  url: string
}
```

### stripe-webhook
**Purpose**: Process Stripe payment events and create entitlements

**Input**: Stripe webhook event (JSON)

**Process**:
1. Verify webhook signature (planned)
2. Parse event data
3. Extract userId from `client_reference_id`
4. Create or update entitlement record
5. Update enrollment record

**Output**:
```typescript
{
  received: true,
  message?: string
}
```

## Access Control Logic

### Route Protection (ProtectedApp)

```typescript
if (!user) {
  redirect to 'https://medicaremastery.app/login'
}

if (!hasActiveAccess) {
  redirect to 'https://medicaremastery.app/pricing'
}

// hasActiveAccess = entitlement.has_active_access && entitlement.payment_verified
```

### Entitlement Verification

1. **On Page Load**: AuthContext fetches entitlement
2. **Polling**: SuccessPage polls until verification
3. **Real-time**: Can be enhanced with Supabase Realtime

## Error Handling

### Payment Failures
- User sees error message on SuccessPage
- Can retry payment from pricing page
- Support link provided

### Session Issues
- Automatic token refresh
- Redirect to login if session invalid
- Clear error messages

### Webhook Failures
- Webhook retries (Stripe handles)
- Idempotent operations (upsert logic)
- Logging for debugging

## Monitoring and Logging

### Console Logging
All critical operations are logged with prefixes:
- `[SIGNUP]`: Account creation events
- `[WEBHOOK]`: Payment webhook processing
- `[SUCCESS]`: Payment verification polling
- `[PROTECTED]`: Access control checks

### Recommended Production Monitoring
- Stripe Dashboard: Payment success rates
- Supabase Dashboard: Database queries and errors
- Application logs: User journey tracking
- Error tracking: Sentry or similar

## Future Enhancements

### Planned Improvements
1. **Webhook Signature Verification**: Add Stripe signature validation
2. **Realtime Updates**: Use Supabase Realtime for instant entitlement updates
3. **Email Notifications**: Send confirmation emails after payment
4. **Subscription Support**: Add recurring payment handling
5. **Grace Period**: Allow temporary access during payment processing
6. **Admin Dashboard**: Manage users and entitlements

### Scalability Considerations
- Database indexing on user_id columns
- Caching layer for entitlement checks
- CDN for static assets
- Edge function optimization

## Testing Strategy

### Unit Tests
- AuthContext state management
- Form validation
- Utility functions

### Integration Tests
- Signup flow end-to-end
- Payment webhook processing
- Access control logic

### E2E Tests
- Complete user journey
- Cross-domain session persistence
- Payment and redirect flow

## Deployment Checklist

- [ ] Supabase project configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Stripe webhook endpoint configured
- [ ] Environment variables set
- [ ] Marketing site deployed
- [ ] Program app deployed
- [ ] DNS records configured
- [ ] SSL certificates active
- [ ] Test complete user flow
- [ ] Monitor logs for errors

## Support and Maintenance

### Regular Tasks
- Monitor payment success rates
- Review error logs
- Update dependencies
- Backup database
- Test webhook endpoint

### Incident Response
1. Check Stripe Dashboard for payment issues
2. Review Supabase logs for errors
3. Verify webhook endpoint is reachable
4. Check DNS and SSL configuration
5. Test authentication flow

---

For deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)
For general information, see [README.md](./README.md)
