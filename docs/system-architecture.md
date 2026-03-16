# DormFlow System Architecture

## Operating model

DormFlow should operate as a multi-tenant SaaS product with strict dorm-level isolation.

- The platform is public for account creation.
- A `dorm` is the core workspace boundary.
- Each dorm is controlled by one or more `landlord` memberships.
- `tenant` and `chef` users do not self-join a dorm. They join only through a landlord-issued invitation.
- A single person can belong to multiple dorms through separate memberships.
- A single person can have different roles in different dorms.

This means DormFlow is not a public marketplace and not a single-organization internal app. It is a shared platform hosting many private dorm workspaces.

## Core access rules

The correct authority model for the product is:

- `Landlord`
  - Creates dorms
  - Invites tenants and chefs
  - Manages rooms, assignments, meal settings, invoices, payments, and maintenance status
  - Can switch between dorms they belong to
- `Tenant`
  - Belongs to a dorm only after accepting a landlord invitation
  - Can view only their own room, invoices, meal choices, and maintenance requests
  - Cannot invite other users or administer the dorm
- `Chef`
  - Belongs to a dorm only after accepting a landlord invitation
  - Can read dorm meal counts and manage meal plans
  - Cannot manage rooms, payments, invitations, or dorm settings

## Domain model

The database should keep `membership` as the main identity bridge between people and dorms.

- `profiles`
  - One row per authenticated account
- `dorms`
  - One workspace per managed dormitory or branch
- `memberships`
  - Connects a profile to a dorm with a role
  - This is the correct place to model multi-dorm access
- `invitations`
  - Landlord-created invitations for tenant or chef onboarding
- `rooms`
  - Physical rentable units within one dorm
- `room_assignments`
  - Connects a tenant membership to one room for a time period
- `meal_plans`
  - Daily menu published at dorm level
- `meal_toggles`
  - Per-tenant per-day meal participation record
- `maintenance_tickets`
  - Tenant-raised requests within a dorm
- `invoices`
  - Monthly bills generated per tenant membership
- `payments`
  - Manual payment records against invoices
- `subscription_entitlements`
  - Plan limits and feature flags per dorm
- `audit_logs`
  - Change history for operational accountability

## Non-negotiable invariants

These rules should stay true across UI, API, and database policy.

- No dorm data is visible without a membership in that dorm.
- Only landlords can create invitations.
- Tenant and chef memberships originate from invitation acceptance, not direct membership editing in the client.
- Invitation acceptance must require the signed-in email to match the invited email.
- One tenant membership can have only one active room assignment at a time.
- Active room assignments for one room must never exceed that room's configured capacity.
- One invoice exists per tenant membership per billing period.
- Meal participation is tracked per tenant membership, not directly per user.
- Cross-dorm reporting is not shown by default. The active dorm controls the workspace context.

## Application architecture

The recommended production shape for this repository is:

1. `React + Vite frontend`
   - Authentication screens
   - Role-specific workspace pages
   - Dorm switcher for multi-membership users
2. `Supabase Auth`
   - Email and password authentication
   - Password reset
   - Email identity for invitation matching
3. `Supabase Postgres`
   - Source of truth for all business data
   - Row-level security for dorm isolation
4. `Database functions and triggers`
   - Dorm creation
   - Invitation acceptance
   - Invoice generation
   - Payment recording
   - Meal toggle initialization and cutoff locking
5. `React Query data layer`
   - Server-state cache by active dorm or active membership
   - Mutation invalidation after landlord and tenant actions

## Correct user journeys

### 1. Landlord self-service onboarding

This is the only fully self-service entry path.

1. User registers a general DormFlow account.
2. User signs in.
3. User has no memberships, so the app routes them to onboarding.
4. User creates their first dorm.
5. The system creates:
   - a dorm row
   - a landlord membership for that user
   - default entitlements
   - an audit log entry
6. The user enters the landlord workspace for that dorm.

### 2. Tenant or chef onboarding

This must be landlord-controlled.

1. Landlord opens the people management area for a dorm.
2. Landlord creates an invitation for `tenant` or `chef`.
3. The system generates an invite link tied to email and dorm.
4. Invitee opens the link.
5. If the invitee already has an account:
   - they sign in
   - the invitation is accepted
   - membership is created or reactivated
6. If the invitee does not have an account:
   - they register using the invited email
   - they sign in
   - the invitation is accepted
7. The invitee lands in the dorm workspace matching their role.

Important product rule:

- Tenants and chefs may create a platform account, but they should not create dorms as part of their normal flow.
- Their normal entry to a dorm is always invite-based.

### 3. Room assignment

1. Landlord invites a tenant.
2. Tenant accepts invitation and becomes an active dorm member.
3. Landlord assigns the tenant membership to a room.
4. The system closes the old assignment if the tenant is moving.
5. Room assignment end dates are treated as exclusive, so a reassignment can start on the same date the previous assignment ends without overlap.
6. The tenant dashboard reads its room state from the active membership.

### 4. Meal workflow

1. Landlord or chef publishes meal plans for future dates.
2. System ensures meal-toggle rows exist for active tenants.
3. Tenant can turn meals on or off before cutoff time.
4. Cutoff lock job prevents late edits.
5. Daily meal counts aggregate from meal toggles.
6. Monthly invoice generation prices consumed meals from stored toggles.

### 5. Billing workflow

1. Landlord triggers invoice generation for a billing month.
2. System calculates rent from room assignment and meal charges from toggles.
3. Invoice is stored per tenant membership.
4. Landlord records payments manually.
5. Invoice status transitions from `issued` to `partial` or `paid`.

### 6. Maintenance workflow

1. Tenant submits a ticket from their active dorm.
2. Ticket is linked to their membership and current room assignment if available.
3. Landlord reviews and updates status.
4. Audit logs capture state transitions.

## Multi-dorm behavior

The system should support these scenarios:

- One landlord managing many dorms in different locations
- One chef working for more than one dorm
- One tenant with historical or concurrent memberships in different dorms
- One user acting as a landlord in one dorm and a tenant in another

The UI pattern should remain:

- One active membership at a time
- One active dorm context at a time
- A visible dorm switcher

Do not merge operational data from different dorms into one default dashboard. That creates permission ambiguity and weakens the mental model.

## Critical workflow corrections for this product

These are the decisions that keep the system coherent:

- Public registration should be described as account creation, not open dorm membership.
- Landlord is the only role that should naturally start from self-registration plus dorm creation.
- Tenant and chef flows should be described as invitation acceptance.
- Links between sign-in and sign-up must preserve invitation context.
- The product should clearly separate:
  - platform account creation
  - dorm membership creation
- A landlord should have a visible way to create additional dorms after the first one.

## Near-term implementation priorities

To make the workflow production-ready, prioritize these next:

1. Add a dedicated invite landing experience that shows dorm name, invited role, and invited email before sign-in or registration.
2. Add a landlord-facing `Create another dorm` action inside the authenticated workspace.
3. Add explicit transfer workflow for moving a tenant from one dorm to another with move-out and new invite.
4. Add background jobs for meal cutoff locking and scheduled invoice generation.
5. Add notification delivery for invitations, invoice reminders, and maintenance updates.

## Final architecture decision

The correct structure for DormFlow is:

- Public platform account system
- Private dorm workspaces
- Landlord-controlled dorm membership
- Membership-based authorization
- Dorm-scoped operations, reports, and billing

That model is the most coherent fit for the current codebase and the business rules you described.
