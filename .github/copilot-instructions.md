# AI Agent Instructions for KPR Management System

## Project Overview
This is a Next.js web application for BNI KPR (mortgage loan) management system. The application helps streamline the mortgage application process and provides dashboards for different user roles.

## Architecture & Key Patterns

### Tech Stack
- Next.js 15.5 with App Router
- TypeScript for type safety
- Zustand for state management
- Tailwind CSS with shadcn/ui components
- Radix UI for accessible components
- Recharts for data visualization

### Directory Structure
- `src/app/*` - Next.js app router pages and layouts
- `src/components/*` - Reusable React components
  - `ui/*` - Base UI components built with shadcn/ui
  - `dialogs/*` - Modal dialog components
  - `data/*` - Mock data and types
- `src/services/*` - API service layer
- `src/store/*` - Zustand store definitions
- `src/lib/*` - Utility functions and core API setup

### Data Flow Patterns
1. API calls are centralized in `src/lib/coreApi.ts` using Axios
2. Auth state is managed in `src/services/auth.ts` with localStorage
3. Global state managed through Zustand stores in `src/store/*`

### Component Patterns
1. Use shadcn/ui components from `src/components/ui/*` for consistent styling
2. Modal dialogs use the pattern in `src/components/dialogs/*`
3. Data visualization uses Recharts with wrapper in `src/components/ui/chart.tsx`

## Development Workflow

### Setup & Running
```bash
npm install
npm run dev # Runs on http://localhost:3000
```

### Key Files for Common Tasks
- Adding new pages: Create in `src/app/*`
- New UI components: Add to `src/components/ui/*`
- API integration: Update `src/lib/coreApi.ts`
- State changes: Modify stores in `src/store/*`

### Theme Customization
- Theme configuration in `components.json`
- Dark/light mode handled by `next-themes` in `ThemeProvider`

## Integration Points
1. Authentication: `src/services/auth.ts` manages login state
2. API Client: `src/lib/coreApi.ts` for backend communication
3. UI Components: Import from `@/components/ui/*`

## Project-Specific Conventions
1. Use `@/` path alias for imports from `src/`
2. Component props use TypeScript interfaces
3. Use shadcn/ui components instead of raw HTML elements
4. Async operations should use the service layer pattern