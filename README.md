# Institutional-Grade NIL Valuation, Reporting & Exchange

This repository establishes the production monorepo foundation for the NIL valuation, reporting, and exchange platform. It includes a dashboard application, an API service, and shared package layers for the UI and domain types.

## Workspace layout

- `apps/web` — Next.js dashboard for market discovery, trading, and campaign monitoring
- `apps/api` — TypeScript API service for market and risk data
- `packages/ui` — shared React components
- `packages/types` — shared domain types and contracts

## Getting started

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the app stack:
   ```bash
   pnpm dev
   ```
3. Build the monorepo:
   ```bash
   pnpm build
   ```

## Default scripts

- `pnpm dev` — runs all workspace dev servers in parallel
- `pnpm build` — builds all workspace packages and apps
- `pnpm typecheck` — runs TypeScript checks across the monorepo
