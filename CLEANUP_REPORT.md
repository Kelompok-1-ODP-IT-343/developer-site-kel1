# Codebase Cleanup Report

Date: 2025-11-06

This report summarizes the unused files/components removed to reduce bundle size, speed up builds, and simplify maintenance. All changes were validated with a production build.

## Removed files (unused)

- src/app/dashboard/simulate/page-copy.tsx
  - Reason: Non-routed copy (filename is not `page.tsx`), not imported anywhere.
- src/services/Untitled-1.json
  - Reason: Temporary artifact; not referenced.
- src/app/components/Footer.tsx
  - Reason: Not imported by any page/component.
- src/app/components/Header.tsx
  - Reason: Not imported by any page/component.
- src/app/components/admin/StatCard.tsx
  - Reason: Not imported by any page/component.
- src/app/components/admin/Table.tsx
  - Reason: Not imported by any page/component.
- src/components/AddProperties.tsx
  - Reason: Not imported by any page/component.
- src/components/ListProperties.tsx
  - Reason: Not imported by any page/component.
- src/components/CustomerInfo.tsx
  - Reason: Not imported by any page/component.
- src/components/dialogs/PropertyDetailsDialog.tsx
  - Reason: Only used by ListProperties (also removed).
- src/components/dialogs/SimulateDialog.tsx
  - Reason: Not imported by any page/component.
- src/components/dialogs/ViewCustomerDialogs.tsx
  - Reason: Only used by CustomerInfo (also removed).
- src/components/dialogs/ViewDevelopersDialog.tsx
  - Reason: Only used by ListProperties (also removed).

Notes:
- The chart wrapper `src/components/ui/chart.tsx` is currently unused; we retained it because it aligns with the project pattern for Recharts wrappers and may be used in the future. Safe to remove later if desired.

## Validation

- Build: PASS (`npm run build`)
- Typecheck: Skipped by Next build (no TS errors surfaced)
- Lint: Not run (unchanged rules); can be run via `npm run lint`

## Impact

- Reduced code surface area and bundle inputs
- Simpler dependency chain for dialogs and mock data UIs no longer in use
- No changes to public APIs or routes

## Follow-ups (optional)

- Consider adding a `typecheck` script (e.g., `tsc --noEmit`) for CI.
- If the `simulate` feature is revived, create a routed page at `src/app/dashboard/simulate/page.tsx`.
- If Recharts wrappers are adopted, refactor `AnalyticsDashboard` and `ChartsSection` to use `src/components/ui/chart.tsx` for consistency.
