# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## URLs

- **Production**: https://crm-cartesian.vercel.app/
- **Local Development**: http://localhost:3000/

## Build & Development Commands

```bash
npm run dev          # Start development server (Next.js with Turbopack)
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Architecture Overview

CRM Cartesian is a sales CRM built with Next.js 16 (App Router), TypeScript, Supabase, and shadcn/ui. The application is in Brazilian Portuguese.

### Tech Stack
- **Frontend**: Next.js 16 with App Router, React 19, TypeScript
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **UI**: shadcn/ui components, Tailwind CSS 4, Radix UI primitives
- **State**: Zustand for UI state, TanStack Query for server state
- **Forms**: react-hook-form + Zod validation
- **Drag & Drop**: dnd-kit for Kanban board
- **Charts**: Recharts for reports

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/             # Auth pages (login, register, forgot-password)
│   ├── (dashboard)/        # Protected dashboard pages
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── layout/             # Sidebar, Header, AppShell
│   ├── pipeline/           # Kanban board components
│   ├── workflows/          # Post-sale workflow components
│   └── [entity]/           # Entity-specific components (clients, deals, etc.)
├── services/               # Data layer - Supabase queries
├── hooks/                  # React Query hooks wrapping services
├── lib/
│   └── supabase/           # Supabase client configs (client.ts, server.ts, middleware.ts)
├── types/                  # TypeScript types including database.types.ts
└── store/                  # Zustand stores
```

### Data Flow Pattern

1. **Services** (`src/services/*.service.ts`): Direct Supabase queries
2. **Hooks** (`src/hooks/use-*.ts`): TanStack Query hooks that wrap services
3. **Components**: Use hooks for data fetching and mutations

### Core Business Entities

- **Organizations**: Multi-tenant isolation (all data scoped by organization_id)
- **Companies** (Clients): Customer companies
- **Projects**: Belong to a company, deals are linked to projects
- **Deals**: Sales opportunities with Kanban pipeline stages
- **Solutions**: Products/services that can be attached to deals (N:N)
- **Workflows**: Post-sale checklists triggered when deals are won
- **Activities**: Timeline events (calls, emails, meetings, notes)

### Supabase Configuration

- Client-side: `src/lib/supabase/client.ts` - use `createClient()`
- Server-side: `src/lib/supabase/server.ts` - use `createServerClient()`
- Middleware: `src/lib/supabase/middleware.ts` - handles session refresh

Environment variables required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Authentication Flow

- Middleware at `middleware.ts` protects routes and refreshes sessions
- Auth pages are in `(auth)` route group (no dashboard layout)
- Dashboard pages are in `(dashboard)` route group (with sidebar layout)
- User signup creates organization + profile via database trigger

### Key Patterns

- All list pages use TanStack Table with DataTable component
- Forms use react-hook-form with Zod schemas
- Toast notifications via Sonner
- Loading states use Skeleton components
- Pipeline uses dnd-kit for drag-and-drop between stages
