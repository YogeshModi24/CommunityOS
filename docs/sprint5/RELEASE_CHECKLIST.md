# CommunityOS Release Checklist

## Prerequisites

- [x] All backend APIs stable and accessible.
- [x] Database schemas finalized.
- [x] NextAuth configuration verified for production (secrets, providers).

## Sprint 5 Sign-off

- [x] **Visual Audit**: Typography, spacing, glassmorphism, and color tokens are consistently applied.
- [x] **Accessibility (a11y)**: `aria-labels` and focus rings implemented. Keyboard navigation verified.
- [x] **Performance**: Static assets optimized via `next/image`. Unnecessary console logs removed.
- [x] **Error Recovery**: `OSStateView` integrated across all primary routes to gracefully handle API errors or empty data.
- [x] **Forms \u0026 Validation**: Inline validation and explicit error states added to data entry flows.
- [x] **Responsive Layout**: Platform scales correctly from 320px to ultra-wide displays without horizontal scroll overflow.

## Build Verification

- [x] `npm run lint` completes without errors or warnings.
- [x] `npm run typecheck` completes without TS errors.
- [x] `npm run build` succeeds.
- [x] Next.js route pre-rendering successfully collects page data for all static/dynamic segments.

## Deployment Steps

1. Push final release candidate to `main`.
2. Configure environment variables on hosting provider (e.g., Vercel).
3. Trigger production build.
4. Verify deployment URL.
