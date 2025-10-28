# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lesson Manager is a Next.js lesson management system for managing music lessons, teachers, students, payments, and schedules. The application supports multi-location management with role-based access control (admin/teachers/users).

## Development Commands

```bash
# Development
pnpm dev                    # Start development server (uses webpack)
pnpm build                  # Build for production (generates Prisma client first)
pnpm build:analyze          # Build with bundle analyzer
pnpm start                  # Start production server

# Database
pnpm gen:prisma            # Generate Prisma client
pnpm prisma generate       # Generate Prisma client (direct)

# Testing
pnpm test                  # Run tests in watch mode
pnpm test:ci               # Run tests once (CI mode)

# Linting
pnpm lint                  # Run ESLint

# Storybook
pnpm storybook             # Start Storybook dev server on port 6006
pnpm build-storybook       # Build Storybook
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Chakra UI v3 + Emotion + Tailwind CSS (Only used for font optimization)
- **Database**: MySQL via Prisma ORM
- **Session**: iron-session (cookie-based, 30-day TTL)
- **State Management**: Zustand
- **Forms**: react-hook-form + zod validation
- **Testing**: Vitest + React Testing Library + Prismock (Prisma mocking)

## Architecture

### Generated Code

The project uses code generation extensively:

- `src/generated/prisma/` - Prisma Client (generated from `prisma/schema.prisma`)
- `src/generated/zod/` - Zod schemas (auto-generated from Prisma schema via zod-prisma-types)

**Always regenerate Prisma client after schema changes**: `pnpm prisma generate`

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth route group (login)
│   ├── (table)/           # Main lesson schedule table
│   ├── (lessons)/         # Lesson management
│   ├── (users)/           # User management
│   ├── (teachers)/        # Teacher management
│   ├── (payments)/        # Payment management
│   ├── (history)/         # History tracking
│   └── (sms)/            # SMS functionality
├── features/              # Feature-based modules (UI + logic)
│   ├── table/            # Main lesson table feature
│   ├── users/            # User management UI
│   ├── teachers/         # Teacher management UI
│   ├── navigation/       # Navigation bar + location selector
│   ├── login/            # Login UI
│   ├── inputs/           # Form input components
│   └── selectors/        # Selector components
├── components/            # Shared UI components
│   ├── ui/               # Base UI components (Chakra UI wrappers)
│   ├── ClientLayout.tsx  # Client-side layout wrapper
│   └── ContentLayout.tsx # Content area layout
├── hooks/                 # Custom React hooks
│   ├── useFetch.ts       # Data fetching hook
│   └── useUpdate.ts      # Data mutation hook
├── lib/                   # Core utilities
│   ├── prisma.ts         # Prisma client instance with query logging
│   └── session.ts        # Session management (iron-session)
├── utils/                 # Helper functions
│   └── network.ts        # Network utilities (parseResponse)
├── brand/                 # Brand styling (colors, themes)
└── generated/             # Auto-generated code (DO NOT EDIT)
```

### Route Groups

Next.js route groups are used to organize routes without affecting URLs:

- API routes: `src/app/(group)/api/resource/route.ts`
- Service logic: `src/app/(group)/service.ts`
- Schemas: `src/app/(group)/schema.ts` (Zod validation schemas)

### Session Management

- Uses `iron-session` with cookie-based sessions (`lmsession`)
- Session data includes: `isAdmin`, `isLoggedIn`, `teacherId`, `userId`, `name`, `locationId`
- Access via `getSession()` from `@/lib/session`
- Login checks: Non-admin users must have valid (non-refunded) payments to log in

### State Management Patterns

1. **Server-side data fetching**: Use React Server Components with Prisma queries
2. **Client-side state**: Zustand stores (e.g., `TableStore` in `src/features/table/stores/`)
3. **Form state**: react-hook-form with Zod resolvers
4. **API calls**: Use `useFetch` and `useUpdate` hooks with `parseResponse` utility

### Prisma Configuration

- Database: MySQL
- Client output: `src/generated/prisma/` (custom output path)
- Query logging: Enabled via `PRISMA_LOG_LEVEL=debug` env variable
- Test mocking: Uses Prismock (see `scripts/test/db.setup.ts`)

### Testing

Tests are colocated with source files (`*.test.ts`). Test setup:

1. Prisma is mocked via Prismock (`scripts/test/vitest.setup.ts`)
2. Mock data is seeded in `beforeAll` hook (`scripts/test/db.setup.ts`)
3. Mock factories in `scripts/test/mocks/` (accessible via `@mocks/*` alias)

To run a single test file:
```bash
pnpm test src/path/to/file.test.ts
```

### Path Aliases

```typescript
@/*        → src/*
@mocks/*   → scripts/test/mocks/*
```

### Key Domain Models

The application manages:

- **Users** (students): Login access, lessons, payments
- **Teachers**: Login access, manage lessons, locations, majors
- **Lessons**: Scheduled lesson slots with teacher/user assignments
- **Payments**: Track user payments and validate login access
- **Holdings**: Temporary lesson holds/pauses
- **LessonBannedTimes**: Teacher unavailability slots
- **WorkingTime**: Teacher working hours
- **Locations**: Multiple physical locations
- **Majors**: Music instrument/subject types

### Authentication Flow

1. Login page: `src/app/(auth)/login/`
2. Login action validates credentials (`service.ts`)
3. Password hashing: SHA-512 with salt (`encryptPassword`)
4. Non-admin users require valid payment to log in (`canLogin`)
5. Session created with user/teacher info + location
6. Root layout fetches session data and passes to `ClientLayout`

### API Route Pattern

All API routes follow this pattern:

```typescript
// src/app/(group)/api/resource/route.ts
export async function GET/POST/PUT/DELETE(request: Request) {
  // 1. Get session
  const session = await getSession();

  // 2. Parse/validate request (Zod schemas)
  // 3. Database operations (Prisma)
  // 4. Return Response with JSON
}
```

Schemas are typically in adjacent `schema.ts` files.

### UI Component Library

- Primary: Chakra UI v3 components from `@chakra-ui/react`
- Custom UI: `src/components/ui/` (wrapped Chakra components)
- Styling: Emotion CSS-in-JS + Tailwind utility classes
- Theme: Custom brand colors in `src/brand/colors`
- Toast notifications: `toaster` from `@/components/ui/toaster`

### Important Naming Conventions

Based on recent commits:
- Use descriptive function names without unnecessary aliasing
- API responses should have consistent types (e.g., `UserSearchResult[]`)
- Business logic function names should clearly indicate their action (e.g., `consumeLessonCount` not `useLessonCount`)

## Common Gotchas

1. **Prisma client path**: Import from `@/generated/prisma`, not `@prisma/client`
2. **Session is server-only**: `getSession()` marked `'use server'`, call from Server Components or Server Actions
3. **Test mocks**: Prisma is fully mocked in tests; use factories from `@mocks/*`
4. **Generated Zod schemas**: Located in `src/generated/zod/`, regenerate after Prisma changes
5. **Package manager**: Use `pnpm` (version 10.12.4+)
6. **Emotion compiler**: Enabled in `next.config.ts` for Chakra UI
