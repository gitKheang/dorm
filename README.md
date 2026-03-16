# DormFlow Harmony

DormFlow Harmony is now wired as a Supabase-backed dormitory and meal management MVP.

Architecture and workflow guidance for the landlord-controlled multi-dorm model is documented in [docs/system-architecture.md](docs/system-architecture.md).

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- React Query
- Supabase

## Local setup

1. Install dependencies:

```sh
npm install
```

2. Create environment variables from `.env.example`:

```sh
cp .env.example .env
```

3. Create a Supabase project and run the migration in:

```sh
supabase/migrations/20260314133000_dormflow_mvp.sql
```

4. Set these values in `.env`:

```sh
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_APP_URL=http://localhost:8080
```

5. Start the app:

```sh
npm run dev
```

## Implemented MVP areas

- Email/password auth and password reset via Supabase Auth
- Membership-aware role access for landlords, tenants, and chefs
- Dorm creation and settings updates
- Room CRUD and tenant room assignment / move-out
- Weekly meal planning and tenant meal toggles
- Monthly invoice generation and landlord-recorded manual payments
- Tenant maintenance requests and landlord status updates
- Live dashboards and reports backed by Supabase queries

## Verification

```sh
npm test
npm run build
```
