# BLEI-E Multi-Asset Risk Dashboard (Tier 2.2)

## Overview

The BLEI-E Dashboard is a **real-time, institutional-grade PM/quant workspace** that surfaces BLEI-E risk signals, CRS states, hedge queues, P&L attribution, and cross-asset contagion paths.

**Core capability:** Real-time visualization of athlete cohorts → Risk states → Hedge action queue → Portfolio impact.

**Architecture:** React frontend (WebSocket) + Node.js backend (Kafka consumer).

**SLA:** Sub-500ms dashboard refresh, p99 latency <200ms.

---

## Architecture Overview

The dashboard operates across **three layers**:

1. **Frontend (React + WebSocket)**
   - Real-time CRS heatmaps
   - Risk state distribution
   - Contagion cascade visualization
   - Hedge action queue
   - P&L attribution by risk layer

2. **Backend (Node.js + Kafka)**
   - Consumes CRS outputs from risk engine
   - Aggregates athlete cohorts
   - Computes portfolio exposures
   - Streams updates via WebSocket

3. **Data Layer (Redis + PostgreSQL)**
   - Real-time CRS cache (Redis)
   - Historical backtest results (PostgreSQL)
   - Audit trails (PostgreSQL)

---

## File Structure

```
tier2-dashboard/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx          # Main dashboard
│   │   │   ├── AthleteMonitor.tsx     # Per-athlete view
│   │   │   ├── HedgeQueue.tsx         # Hedge action queue
│   │   │   ├── PnLAttribution.tsx     # P&L breakdown
│   │   │   └── ContagionAnalysis.tsx  # Cross-asset cascade view
│   │   ├── components/
│   │   │   ├── CRSHeatmap.tsx         # Athlete cohort heatmap
│   │   │   ├── RiskStateChart.tsx     # Risk state distribution
│   │   │   ├── ContagionPath.tsx      # Cascade visualization
│   │   │   ├── HedgeActionQueue.tsx   # Pending actions
│   │   │   ├── FactorBreakdown.tsx    # PMF-E, SEF-E, etc.
│   │   │   ├── ExposureMatrix.tsx     # Asset exposures
│   │   │   └── LiveMetrics.tsx        # Latency, throughput, errors
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts        # WebSocket connection
│   │   │   ├── useCRS.ts              # CRS state management
│   │   │   └── useExposures.ts        # Exposure calculations
│   │   ├── services/
│   │   │   ├── api.ts                 # REST API client
│   │   │   ├── websocket.ts           # WebSocket client
│   │   │   └── analytics.ts           # Event tracking
│   │   ├── styles/
│   │   │   ├── index.css              # Global styles
│   │   │   ├── dashboard.css
│   │   │   └── heatmap.css
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   └── tsconfig.json
├── backend/
│   ├── src/
│   │   ├── index.ts                   # Entry point
│   │   ├── websocket-server.ts        # WebSocket server
│   │   ├── kafka-consumer.ts          # Kafka CRS consumer
│   │   ├── dashboard-feed.ts          # Real-time feed aggregation
│   │   ├── pnl-attribution.ts         # P&L calculation
│   │   ├── exposure-calculator.ts     # Portfolio exposure calc
│   │   ├── auth.ts                    # PM/quant RBAC
│   │   ├── cache.ts                   # Redis caching
│   │   ├── db.ts                      # PostgreSQL connection
│   │   └── config.ts                  # Environment config
│   ├── package.json
│   └── tsconfig.json
├── k8s/
│   ├── deployment.yaml                # Frontend + backend pods
│   ├── service.yaml                   # ClusterIP services
│   ├── ingress.yaml                   # Ingress for frontend
│   ├── configmap.yaml                 # Config (K8s)
│   └── hpa.yaml                       # Autoscaling
├── docker-compose.yml                 # Local dev
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- React 18+
- Docker & Kubernetes (optional)
- Kafka broker (for CRS ingestion)
- Redis + PostgreSQL (for caching/storage)

### Local Development (docker-compose)

```bash
git clone https://github.com/drb-apes/institutional-grade-nil-valuation-reporting-and-exchange.git
cd tier2-dashboard

# Start all services
docker-compose up -d

# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# Prometheus: http://localhost:9090
```

### Frontend Development

```bash
cd frontend
npm install
npm start  # Starts dev server on port 3000
```

### Backend Development

```bash
cd backend
npm install
npm run dev  # Starts API server on port 3001
```

---

## Core Components

### 1. CRS Heatmap

Real-time visualization of athlete cohorts by CRS and risk state.

**Features:**
- Athlete rows sorted by CRS (descending)
- Color coding by risk state (0=green, 1=yellow, 2=orange, 3=red, 4=dark red)
- Hover for factor breakdown (PMF-E, SEF-E, VVE-E, FBR-E, CSE-E)
- Click to drill into athlete details

### 2. Risk State Distribution

Pie chart showing distribution of athlete cohort across risk states 0–4.

**Displays:**
- Number of athletes in each state
- Percentage breakdown
- Trend (increasing/decreasing state count)
- Alert threshold (% of State 3–4 athletes)

### 3. Contagion Path Visualization

Network graph showing cross-asset cascades.

**Nodes:**
- Athletes (circles)
- Assets (squares: Nike, Adidas, Disney, DraftKings)

**Edges:**
- Directed arrows showing contagion flow
- Edge thickness proportional to contagion multiplier
- Edge color representing decay state (bright = fresh, faded = old)

### 4. Hedge Action Queue

Table of pending hedge actions sorted by urgency and state.

**Columns:**
- Athlete ID
- Current state (0–4)
- Action (reduce Nike 10%, add DKNG vol, etc.)
- Notional USD
- Urgency (immediate, queue, monitor)
- Suggested execution window

### 5. P&L Attribution

Breakdown of realized/unrealized P&L by risk layer.

**Rows:**
- Equity L/S overlay
- Volatility overlay
- Cross-asset overlay
- Risk premia overlay

**Columns:**
- P&L by layer (USD)
- % contribution to total
- Sharpe ratio (annualized)
- Max drawdown

---

## WebSocket Message Protocol

### DashboardUpdate (Server → Client)

```typescript
interface DashboardUpdate {
  timestamp: number;
  athlete_id: string;
  crs: number;
  state: RiskState;  // 0-4
  factors: {
    PMF_E_zscore: number;
    SEF_E_zscore: number;
    VVE_E_zscore: number;
    FBR_E_zscore: number;
    CSE_E_zscore: number;
  };
  sponsor_exposures: {
    [sponsor: string]: number;  // Notional USD
  };
  hedge_actions: HedgeAction[];
  contagion_paths: ContagionPath[];
  audit_hash: string;  // For reproducibility verification
}
```

### HedgeAction

```typescript
interface HedgeAction {
  state: RiskState;
  asset: string;  // "Nike", "Adidas", "Disney", "DraftKings"
  action_type: string;  // "reduce", "add_vol", "rv_rotate", "exit", "put_hedge", etc.
  notional_usd: number;
  urgency: "immediate" | "queue" | "monitor";
  rationale: string;
  suggested_execution_window_minutes: number;
}
```

### ContagionPath

```typescript
interface ContagionPath {
  source_asset: string;  // "athlete:athlete_123"
  destination_asset: string;  // "Nike", "DraftKings", etc.
  hours_elapsed: number;
  decay_multiplier: number;  // 0-1, remaining impact
  estimated_impact_pct: number;  // Expected move
}
```

---

## API Endpoints

### REST Endpoints

```
GET  /api/athletes                  # List all monitored athletes
GET  /api/athletes/:id              # Get athlete details
GET  /api/crs-history/:id           # Get CRS time series
GET  /api/exposures                 # Current portfolio exposures
GET  /api/hedge-queue               # Pending hedge actions
GET  /api/pnl-attribution           # P&L breakdown
GET  /api/contagion-paths           # Current contagion cascades
GET  /api/metrics/latency           # System latency metrics
GET  /api/metrics/throughput        # Messages/sec
POST /api/hedge-actions/:id/approve # Approve hedge action
POST /api/hedge-actions/:id/reject  # Reject hedge action
```

### WebSocket

```
ws://localhost:3001/ws
  - Continuous DashboardUpdate stream
  - Sub-500ms refresh SLA
```

---

## Role-Based Access Control (RBAC)

### PM (Portfolio Manager)
- View: Dashboard, athlete monitor, hedge queue, P&L attribution
- Actions: Approve/reject hedge actions
- Restrictions: Cannot modify risk parameters

### Quant
- View: All pages
- Actions: Approve/reject hedge actions, modify risk model parameters
- Restrictions: Cannot approve trades >$50M

### Risk
- View: Dashboard, contagion analysis, metrics
- Actions: Override risk states, adjust CSE-E validation gates
- Restrictions: Read-only on actual hedge queue

### Trader
- View: Hedge queue (filtered by urgency)
- Actions: Execute approved actions
- Restrictions: Cannot modify risk signals

---

## Performance & Monitoring

### Key Metrics (Prometheus)

```
blei_e_dashboard_websocket_connections       # Active WS connections
blei_e_dashboard_message_latency_ms          # WebSocket message latency (p50, p99)
blei_e_dashboard_crs_update_frequency_hz     # CRS updates/sec
blei_e_dashboard_redis_cache_hit_rate        # Cache hit % 
blei_e_dashboard_postgres_query_latency_ms   # DB query latency
blei_e_dashboard_hedge_actions_queued        # Outstanding hedge actions
blei_e_dashboard_false_positives_detected    # CSE-E validation gate rejects
```

### SLA

- **WebSocket message latency:** <200ms p99
- **Dashboard refresh:** <500ms p95
- **Cache hit rate:** >90%
- **System uptime:** >99.5%

---

## Deployment

### Kubernetes

```bash
# Apply config and deploy
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

# Check status
kubectl get pods -l app=blei-e-dashboard
kubectl logs -f deployment/blei-e-dashboard-frontend
```

---

## Documentation

- **[Frontend Setup](./docs/FRONTEND_SETUP.md)**
- **[Backend Architecture](./docs/BACKEND_ARCHITECTURE.md)**
- **[WebSocket Protocol](./docs/WEBSOCKET_PROTOCOL.md)**
- **[RBAC Configuration](./docs/RBAC.md)**
- **[Performance Tuning](./docs/PERFORMANCE.md)**

---

## License

Apache 2.0
