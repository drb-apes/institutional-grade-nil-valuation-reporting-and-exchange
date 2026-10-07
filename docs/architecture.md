# Institutional Grade NIL System Architecture

## 1. Purpose

The Institutional Grade NIL valuation platform unifies two economic surfaces:

- Track A: athlete-level valuation, market divergence, and sponsor buyouts
- Track B: pro-grade swaps, cohort baskets, and sponsor yield tranches

Both tracks share a common truth layer based on telemetry, athlete intelligence, and risk-state modeling.

## 2. High-level system flow

```text
Device telemetry
    -> normalization and validation
    -> athlete signal engine
    -> Model NIL calculation
    -> Market NIL + order book
    -> divergence monitoring
    -> buy/sell execution
    -> sponsor yield and hedge engine
    -> settlement and reporting
```

## 3. Architecture domains

### Shared domain

- athlete identity graph
- market pricing logic
- shared risk engine
- settlement primitives
- telemetry schema

### Track A

- athlete valuation
- market divergence
- sponsor buyout
- NIL units
- settlement events

### Track B

- pro swaps
- cohort baskets
- exposure management
- sponsor yield tranche logic
- parametric hedging

## 4. Risk model

The system evaluates a composite risk score using:

- interaction latency
- dwell-time compression
- engagement velocity drops
- sponsor spend shock
- athlete output shock

This maps to CRS states:

- CRS-0: normal
- CRS-1: elevated
- CRS-2: stressed
- CRS-3: circuit breaker activated

## 5. Data contracts

Canonical data is normalized into a standard metric format:

```ts
{
  source: 'whoop',
  sourceDevice: 'whoop-4',
  athleteId: 1,
  type: 'readiness',
  value: 88,
  unit: 'score',
  timestamp: '2026-10-06T00:00:00.000Z',
  qualityScore: 0.95,
  metadata: { ... }
}
```

## 6. Scalability notes

For production, add:

- Redis for real-time market cache
- Postgres for reference data and accounting
- Kafka / NATS for event streaming
- worker queues for settlement and hedging
- observability and alerting pipeline

## 7. Recommended next milestones

1. Add persistence and migrations
2. Add auth and wallet integrations
3. Add order book matching engine
4. Add settlement ledger and payout scheduler
5. Implement automated hedging workers
