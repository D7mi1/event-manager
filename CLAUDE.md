# Meras (مِراس) - Event Management Platform

## Project Overview
Arabic RTL event management platform built on Next.js 15 + Supabase. Supports both social events (weddings, graduations) and business events (conferences, exhibitions).

## Architecture
- **Framework**: Next.js 15 (App Router) + React 19 + TypeScript 5
- **Database**: Supabase (PostgreSQL + Auth + Realtime + Storage)
- **Styling**: Tailwind CSS 4 + shadcn/ui + Framer Motion
- **State**: Zustand (client state) + TanStack React Query (server state)
- **Validation**: Zod schemas + React Hook Form
- **Payments**: Polar.sh (Merchant of Record)
- **Monitoring**: Sentry
- **PWA**: @ducanh2912/next-pwa

## Directory Structure
```
lib/                    # Canonical source for all utilities, services, hooks
  supabase/             # Supabase client/server
  services/             # AI, WhatsApp, email services
  hooks/                # React hooks (useEventWithCache, useTicket, etc.)
  stores/               # Zustand stores
  schemas/              # Zod validation schemas (domain-specific)
  schemas.ts            # Main Zod schemas file
  providers/            # React providers (Query, Auth)
  contexts/             # React contexts
  billing/              # Polar.sh integration
  utils/                # General utilities
  config/               # Configuration (Sentry, etc.)
components/
  ui/                   # shadcn/ui primitives
  layout/               # Navbar, Analytics, LiveChat
  marketing/            # HeroSection, FeatureSlider, StickyCTA
  events/               # ShareInvite, TemplateDesigner
  dashboard/            # Dashboard-specific components
  seating/              # Seating arrangement components
  surveys/              # Survey components
app/
  api/                  # API routes
  actions/              # Server actions
  dashboard/            # Dashboard pages
  (pages)               # Public pages (login, register, pricing, etc.)
```

## Conventions

### Imports
- Always import from `@/lib/` - never from `@/app/utils/` or `@/app/hooks/`
- Supabase client: `import { supabase } from '@/lib/supabase/client'`
- Supabase server: `import { createClient } from '@/lib/supabase/server'`

### Language & RTL
- UI text is Arabic. Code and comments can mix Arabic and English.
- Root layout uses `dir="rtl"` and Alexandria font
- Dark theme: `bg-[#0A0A0C]` with white text

### API Routes
- All API routes require auth via `supabase.auth.getUser()`
- Ownership verification required before CRUD operations
- Error responses use generic Arabic messages (no `error.message` leak)
- CORS headers via `getCorsHeaders()` from `@/lib/cors`

### Components
- Use shadcn/ui components from `components/ui/`
- Toast notifications via Sonner (`toast` from `sonner`)
- Icons from `lucide-react`

### Database
- Event columns: `name`, `date`, `location_name`, `user_id` (not title/event_date/location)
- Always validate with Zod before DB operations
- Use `.eq('user_id', user.id)` for ownership checks

### Testing
- Jest + @testing-library/react
- Test files: co-located or in `__tests__/` directories
- Run: `npm run test`, `npm run test:coverage`

### Build
- `npm run build` must pass after every change
- `npm run type-check` for TypeScript verification
- ESLint configured with `ignoreDuringBuilds: true` (fix later)
