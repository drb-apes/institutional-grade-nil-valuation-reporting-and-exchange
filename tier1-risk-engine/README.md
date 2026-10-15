# BLEI-E Multi-Asset Risk Engine (Tier 1)

## Overview

The BLEI-E Risk Engine is a **cross-institutional, platform-agnostic multi-asset risk fabric** that converts athlete-level signals into tradeable risk outputs across sponsors, media, betting platforms, and team assets.

**Core capability:** Ingest BLEI-E factor deltas → Output risk states, hedge triggers, contagion paths, and cross-asset overlays.

**Deployment target:** Any institutional environment (banks, hedge funds, quant shops, exchanges).

---

## Architecture Overview

The engine operates across **six layers**:

1. **Signal Ingestion Layer** — Raw athlete signals (biometrics, sentiment, virality)
2. **Factor Normalization Layer** — Convert to z-scores, percentiles, vol-adjusted deltas
3. **Cross-Asset Mapping Layer** — Link BLEI-E factors to sponsor/media/betting assets
4. **Risk State Engine** — Compute Composite Risk Score (CRS) and risk states (0–4)
5. **Hedge Action Engine** — Convert risk states into tradeable actions
6. **Portfolio Overlay Engine** — Apply signals to multi-asset portfolios

---

## Key Characteristics

### Signal Latency
- **Biometric wearables:** 30–90 seconds (device → cloud)
- **Social/virality feeds:** 5–20 seconds (API → ingestion)
- **Sentiment/NLP:** 20–40 seconds (tokenization → scoring)
- **BLEI-E factor normalization:** 10–20 seconds
- **Cross-asset mapping:** <5 seconds
- **End-to-end:** ~90 seconds to ~3 minutes (sub-5-minute requirement ✓)

### Beta Stability (Regime-Dependent)
- **Stable periods:** 5–10% drift over 30 days
- **Unstable periods:** 20–40% drift (earnings, macro shocks, athlete events)
- **Post-earnings reversion:** 3–7 trading days
- **Volatility spike compression:** βs compress toward market beta, regain explanatory power faster than macro factors

### Contagion Multipliers (Log-Normal Decay)
- **Athlete → Sponsor:** Immediate impact, half-life 2–6 hours
- **Sponsor → Media:** Weaker link, half-life 6–18 hours
- **Media → Betting:** Non-linear, spikes during game windows, half-life minutes

### CSE-E (Compliance & Stability) Validation
- Two-source confirmation required
- State 4 (Critical) gated until validated
- Prevents false rotations from rumors, satire, misinterpreted footage

---

## File Structure

```
tier1-risk-engine/
├── src/
│   ├── crs-engine.ts              # Core CRS formula + state logic
│   ├── factor-normalizer.ts       # z-score, percentile, vol-adjustment
│   ├── asset-mapper.ts            # β coefficient lookup + exposure calc
│   ├── contagion-engine.ts        # Log-normal decay model
│   ├── hedge-action-generator.ts  # State 2–4 actions
│   ├── kafka-consumer.ts          # Signal ingestion (Kafka/Kinesis)
│   ├── audit-logger.ts            # Full reproducibility logs
│   ├── types.ts                   # TypeScript interfaces
│   └── config.ts                  # Environment config, beta matrix loader
├── backtester/
│   ├── athlete-event-parser.ts    # Event labeling (injuries, virality, etc.)
│   ├── sponsor-ticker-mapper.ts   # Asset universe mapping
│   ├── beta-regression.ts         # OLS + rolling window
│   ├── regime-detector.ts         # Stable vs. unstable periods
│   └── backtest-harness.ts        # Main backtester
├── k8s/
│   ├── deployment.yaml            # Pod spec
│   ├── configmap.yaml             # Beta matrix, thresholds
│   ├── service.yaml               # ClusterIP
│   └── hpa.yaml                   # Autoscaling rules
├── docker/
│   ├── Dockerfile
│   └── .dockerignore
├── prometheus/
│   └── metrics.yaml               # Latency, CRS distribution, state transitions
├── tests/
│   ├── crs-engine.test.ts
│   ├── hedge-action.test.ts
│   ├── audit-trail.test.ts
│   └── contagion.test.ts
├── data/
│   ├── athlete-events.json        # Labeled historical events
│   ├── sponsor-returns.parquet    # OHLCV data (2yr)
│   ├── blei-e-factors.parquet     # Pre-computed factors
│   └── beta-calibration.json      # Output coefficients
├── notebooks/
│   ├── athlete-to-sponsor.ipynb
│   ├── regime-analysis.ipynb
│   └── beta-drift.ipynb
├── package.json
└── tsconfig.json
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Kubernetes (optional, for deployment)
- Kafka/Kinesis credentials (for signal ingestion)

### Installation

```bash
git clone https://github.com/drb-apes/institutional-grade-nil-valuation-reporting-and-exchange.git
cd institutional-grade-nil-valuation-reporting-and-exchange
git checkout blei-e-risk-engine-foundation
npm install
```

### Run Locally (Development)

```bash
# Start CRS calculator (listens on port 3000)
npm run dev

# Run tests
npm test

# Run backtest
npm run backtest
```

### Deploy to Kubernetes

```bash
# Load beta matrix and thresholds
kubectl apply -f k8s/configmap.yaml

# Deploy service
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml

# Check status
kubectl get pods -l app=blei-e-crs-engine
```

---

## Core Components

### 1. CRS Engine

Computes the **Composite Risk Score** and assigns risk states:

```
CRS = w1·PMF_E + w2·SEF_E + w3·VVE_E + w4·FBR_E - w5·CSE_E
```

**Risk States:**
- **0 (Stable):** No action
- **1 (Watch):** Mild deterioration, monitor
- **2 (Elevated):** Pre-injury window, reduce exposure 10–20%
- **3 (High Risk):** Behavioral volatility, add vol hedge
- **4 (Critical):** Injury/news window, exit/rotate (gated by CSE-E validation)

### 2. Factor Normalizer

Normalizes BLEI-E factors into equity-compatible scores:
- Z-scores
- Percentile ranks
- Rolling volatility adjustments
- Cross-athlete normalization
- Cross-sport harmonization

### 3. Asset Mapper

Maps BLEI-E factors to market-linked assets via β coefficients:

```json
{
  "Nike": {"PMF_E": 0.42, "SEF_E": 0.18, "VVE_E": 0.55, "FBR_E": -0.12},
  "Adidas": {"PMF_E": 0.38, "SEF_E": 0.52, "VVE_E": 0.22, "FBR_E": 0.08},
  "Disney": {"PMF_E": 0.15, "SEF_E": 0.38, "VVE_E": 0.62, "FBR_E": 0.05},
  "DraftKings": {"PMF_E": 0.71, "SEF_E": 0.12, "VVE_E": 0.48, "FBR_E": 0.35}
}
```

### 4. Contagion Engine

Models cross-asset cascades using log-normal decay:

```typescript
function contagionMultiplier(
  fromAsset: string,
  toAsset: string,
  hoursElapsed: number
): number {
  const halfLife = getHalfLife(fromAsset, toAsset);
  const lambda = Math.log(2) / halfLife;
  return Math.exp(-lambda * hoursElapsed);
}
```

### 5. Hedge Action Generator

Converts risk states into tradeable actions:

```
State 2 (Elevated):
  - Reduce sponsor exposure 10–20%
  - Add light vol hedge
  - Begin RV rotation

State 3 (High Risk):
  - Add short-dated vol
  - Increase RV rotation
  - Reduce correlated assets

State 4 (Critical):
  - Exit sponsor exposure
  - Add puts
  - Long competitor
  - Long media virality
  - Long betting platforms
```

---

## Integration Points

BLEI-E is designed to integrate into any institutional environment:

- **Bank risk systems:** Athena-style, SecDB-style, Strats-style
- **Hedge fund risk fabrics:** Citadel, Millennium, Point72
- **Quant research pipelines:** Python, TypeScript, Rust
- **Multi-prime execution:** Compatible with any prime broker

---

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Backtest (full suite)
npm run backtest

# Backtest (specific sponsor)
npm run backtest -- --sponsor Nike
```

---

## Monitoring & Observability

Metrics exposed via Prometheus:

- `blei_e_crs_value` — Current CRS
- `blei_e_risk_state` — Current risk state (0–4)
- `blei_e_signal_latency_ms` — End-to-end latency (p50, p99)
- `blei_e_factor_drift_pct` — β coefficient drift by period
- `blei_e_hedge_actions_queued` — Outstanding hedge actions
- `blei_e_false_positives` — CSE-E validation gate rejects

---

## Documentation

- **[Architecture Deep Dive](./docs/ARCHITECTURE.md)**
- **[Factor Definitions](./docs/FACTORS.md)**
- **[Beta Calibration](./docs/BETA_CALIBRATION.md)**
- **[Contagion Modeling](./docs/CONTAGION.md)**
- **[CSE-E Compliance](./docs/COMPLIANCE.md)**
- **[API Reference](./docs/API.md)**

---

## License

Apache 2.0
