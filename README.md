# Medicare Mastery Platform

A comprehensive certification program platform with unified authentication, payment processing, and cross-domain access control.

## Overview

Medicare Mastery is a dual-application platform consisting of:

1. **Marketing Site** (`medicaremastery.app`) - Landing page, enrollment, and payment
2. **Program App** (`app.medicaremastery.app`) - Protected dashboard for enrolled students

Both applications share the same Supabase backend for seamless authentication and data synchronization.

## Features

- **Unified Authentication**: Single Supabase instance shared across both domains
- **Payment Processing**: Integrated Stripe Checkout with webhook verification
- **Access Control**: Server-authoritative entitlement system with Row Level Security
- **Cross-Domain Sessions**: Persistent authentication across subdomains
- **Automatic Redirects**: Seamless flow from signup to payment to dashboard

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Payments**: Stripe Checkout + Webhooks
- **Hosting**: Static hosting (Vercel, Netlify, etc.)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Stripe account

### Installation

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials
```

### Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/          # React components
│   ├── AuthModal.tsx    # Signup/Login modal
│   ├── SuccessPage.tsx  # Payment success + redirect
│   ├── ProtectedApp.tsx # Route protection wrapper
│   └── ProgramDashboard.tsx # Main dashboard
├── contexts/
│   └── AuthContext.tsx  # Auth state management
├── lib/
│   └── supabase.ts      # Supabase client config
└── main.tsx            # App entry point

supabase/
├── migrations/         # Database schema
└── functions/          # Edge Functions
    ├── create-checkout-session/
    └── stripe-webhook/
```

## Database Schema

### Tables

- **user_profiles**: Extended user information (name, phone)
- **enrollments**: Enrollment tracking and history
- **entitlements**: Payment-gated access control

### Security

All tables use Row Level Security (RLS) with restrictive policies:
- Users can only access their own data
- Service role (webhooks) can write entitlements
- Frontend has read-only access to entitlements

## Payment Flow

1. User creates account on marketing site
2. Account creation triggers Stripe Checkout Session
3. User completes payment on Stripe
4. Stripe webhook creates entitlement record
5. Success page polls for entitlement confirmation
6. Automatic redirect to program app with preserved session

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy

1. Configure Supabase project and run migrations
2. Deploy Edge Functions for Stripe integration
3. Configure Stripe webhook endpoint
4. Build and deploy marketing site
5. Build and deploy program app

## Environment Variables

```env
VITE_SUPABASE_URL=https://[project].supabase.co
VITE_SUPABASE_ANON_KEY=[your-anon-key]
```

Edge Functions use server-side environment variables (configured in Supabase):
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`

## Development Workflow

### Adding New Features

1. Create/update database schema in migrations
2. Update TypeScript types in `src/lib/supabase.ts`
3. Add/modify components as needed
4. Test authentication and access control
5. Build and deploy

### Testing

```bash
# Run type checking
npm run typecheck

# Run linter
npm run lint

# Build to verify no errors
npm run build
```

## License

Proprietary - All rights reserved

## Support

For questions or issues, contact support@medicaremastery.com
