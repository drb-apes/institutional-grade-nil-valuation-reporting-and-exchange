# Institutional Grade NIL Valuation & Exchange

A production-ready monorepo foundation for a dual-track NIL intelligence and exchange system.

## Overview

This repository combines:

- Track A: valuation modeling, market divergence, sponsor buyout, and NIL unit settlement
- Track B: professional-grade swap, cohort basket, and sponsor-backed yield tranche mechanics
- Shared baseline: telemetry normalization, valuation logic, risk scoring, and automated hedging

## Project architecture

```text
.
├── apps
│   ├── api
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── server.ts
│   │       └── routes
│   │           ├── track-a.ts
│   │           └── track-b.ts
│   └── web
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src
│           ├── App.tsx
│           ├── main.tsx
│           ├── styles.css
│           └── lib
│               └── api.ts
├── packages
│   ├── engine
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src
│   │       ├── index.ts
│   │       ├── ingestion
│   │       │   └── normalize.ts
│   │       ├── track-a
│   │       │   └── valuation.ts
│   │       └── track-b
│   │           └── tranches.ts
│   └── shared
│       ├── package.json
│       ├── tsconfig.json
│       └── src
│           ├── index.ts
│           ├── modelNil.ts
│           ├── risk.ts
│           └── types.ts
├── docs
│   ├── architecture.md
│   ├── api-contract.md
│   ├── model-nil-risk-engine.md
│   └── issue-plan.md
├── .gitignore
├── package.json
├── tsconfig.base.json
├── turbo.json
└── README.md
```

## Getting started

```bash
npm install
npm run build
npm run dev --workspace @ig-nil/api
npm run dev --workspace @ig-nil/web
```

## Stack

- TypeScript
- Express
- React + Vite
- Shared domain packages
- Monorepo workspaces

## Key concepts

- Model NIL: intrinsic value from performance, athlete profile, and demand signals
- Market NIL: order-book-driven market price
- Divergence: difference between model and market values
- CRS: risk states from latency, dwell time, engagement, revenue stress, and athlete performance shocks
- Parametric hedge: automated response when risk state enters crisis thresholds

## Notes

This repository is a working foundation and should be expanded with persistence, authentication, worker jobs, and a formal event bus as needed for production scale.
