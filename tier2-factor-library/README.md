# BLEI-E Factor Library (Tier 2)

## Overview

The BLEI-E Factor Library is a **cross-institutional, multi-language factor definition and normalization system** that converts raw athlete signals into equity-compatible BLEI-E factors.

**Core capability:** Ingest raw athlete data → Output normalized, standardized, institutional-grade BLEI-E factors ready for quant models, risk engines, and portfolio overlays.

**Supported languages:** TypeScript/JavaScript, Python (via bindings).

**Distribution:** Private npm registry + private PyPI.

---

## Architecture Overview

The library operates across **five factor channels**:

1. **PMF-E** (Performance Momentum Factor - Equity)
   - Raw input: Athletic performance metrics (speed, power, endurance deltas)
   - Output: Standardized z-score, percentile rank, volatility-adjusted delta
   - Use case: Predict sponsor equity moves on performance changes

2. **SEF-E** (Sentiment & Emotion Factor - Equity)
   - Raw input: Social sentiment, media tone, athlete interviews
   - Output: Normalized sentiment score (-1 to +1), sentiment volatility
   - Use case: Detect emotional volatility affecting brand perception

3. **VVE-E** (Virality & Visibility Factor - Equity)
   - Raw input: Social mentions, trending hashtags, media coverage
   - Output: Virality velocity (mentions/hour), visibility percentile
   - Use case: Forecast media equity and betting platform moves

4. **FBR-E** (Financial Behavior & Risk Factor - Equity)
   - Raw input: Financial transactions, endorsement signals, spending patterns
   - Output: Financial stress indicator, risk score
   - Use case: Detect financial distress affecting sponsors

5. **CSE-E** (Compliance & Stability Factor - Equity)
   - Raw input: League compliance events, disciplinary signals, contract status
   - Output: Compliance score, stability indicator, source count
   - Use case: Gate high-risk trading actions

---

## File Structure

```
tier2-factor-library/
├── src/
│   ├── index.ts                    # Main export
│   ├── factors/
│   │   ├── pmf-e.ts                # Performance Momentum Factor
│   │   ├── sef-e.ts                # Sentiment & Emotion Factor
│   │   ├── vve-e.ts                # Virality & Visibility Factor
│   │   ├── fbr-e.ts                # Financial Behavior & Risk Factor
│   │   ├── cse-e.ts                # Compliance & Stability Factor
│   │   └── factory.ts              # Factory for creating factor instances
│   ├── normalizers/
│   │   ├── zscore-normalizer.ts    # Z-score normalization
│   │   ├── percentile-normalizer.ts # Percentile ranking
│   │   ├── volatility-adjuster.ts  # Rolling volatility adjustment
│   │   ├── cross-athlete-harmonizer.ts # Cross-athlete normalization
│   │   └── cross-sport-harmonizer.ts   # Cross-sport harmonization
│   ├── types.ts                    # TypeScript interfaces (shared with risk engine)
│   ├── constants.ts                # Global thresholds, decay rates
│   └── config.ts                   # Runtime configuration
├── python/
│   ├── blei_e_factors/
│   │   ├── __init__.py
│   │   ├── pmf_e.py
│   │   ├── sef_e.py
│   │   ├── vve_e.py
│   │   ├── fbr_e.py
│   │   ├── cse_e.py
│   │   ├── normalizers.py
│   │   └── types.py
│   └── setup.py
├── docs/
│   ├── FACTOR_DEFINITIONS.md       # Detailed factor specs
│   ├── NORMALIZATION_SPEC.md       # Normalization methodology
│   ├── INTEGRATION_GUIDE.md        # How to integrate into your systems
│   ├── EXAMPLES.md                 # Code examples
│   └── API_REFERENCE.md            # Complete API docs
├── tests/
│   ├── factors.test.ts
│   ├── normalizers.test.ts
│   ├── cross-sport.test.ts
│   └── reproducibility.test.ts
├── notebooks/
│   ├── factor-distribution-analysis.ipynb
│   ├── normalization-walkthrough.ipynb
│   └── cross-asset-correlation.ipynb
├── package.json
├── tsconfig.json
└── README.md
```

---

## Getting Started

### TypeScript Installation

```bash
npm install @drb-apes/blei-e-factors --registry https://npm.your-institution.com/
```

### Python Installation

```bash
pip install blei-e-factors --index-url https://pypi.your-institution.com/simple/
```

---

## Core Factor Definitions

### PMF-E: Performance Momentum Factor

**Raw inputs:**
- Athletic performance deltas (speed, power, endurance)
- Game-day telemetry (exertion level, fatigue)
- Injury recovery status
- Training load

**Output:**
```typescript
interface PMFEFactor {
  raw_value: number;           // Raw performance delta
  zscore: number;              // Standardized (μ=0, σ=1)
  percentile: number;          // 0-100 rank
  volatility_adjusted_pct: number; // Vol-adjusted change
  momentum_direction: "positive" | "negative" | "neutral";
}
```

**Sponsor sensitivity:**
- Nike: High (0.42 β)
- Adidas: High (0.38 β)
- DraftKings: Very High (0.71 β)

---

### SEF-E: Sentiment & Emotion Factor

**Raw inputs:**
- Social media sentiment (Twitter, Instagram, TikTok)
- Media article tone
- Fan sentiment indices
- Athlete interviews
- Comments/reactions volume

**Output:**
```typescript
interface SEFEFactor {
  sentiment_score: number;     // -1 (very negative) to +1 (very positive)
  sentiment_zscore: number;
  sentiment_percentile: number;
  volatility_index: number;    // Emotional swings
  trend: "improving" | "declining" | "stable";
}
```

**Sponsor sensitivity:**
- Adidas: High (0.52 β)
- Disney: Medium (0.38 β)
- Nike: Low (0.18 β)

---

### VVE-E: Virality & Visibility Factor

**Raw inputs:**
- Social mentions per hour
- Trending hashtag rank
- Media coverage volume
- YouTube/TikTok engagement
- Google search trends

**Output:**
```typescript
interface VVEEFactor {
  virality_velocity: number;   // Mentions/hour (normalized)
  visibility_percentile: number; // 0-100
  engagement_rate: number;     // Interactions per mention
  trend_direction: "accelerating" | "stable" | "decelerating";
  half_life_minutes: number;   // Time for virality to decay 50%
}
```

**Sponsor sensitivity:**
- Nike: High (0.55 β)
- Disney: High (0.62 β)
- DraftKings: Medium (0.48 β)

---

### FBR-E: Financial Behavior & Risk Factor

**Raw inputs:**
- Sponsorship revenue signals
- Endorsement deal flow
- Personal financial behavior
- Spending patterns
- Contract status changes

**Output:**
```typescript
interface FBREFactor {
  financial_stress_score: number; // 0 (healthy) to 1 (stressed)
  risk_indicator: number;         // -1 to +1
  revenue_stability: number;      // 0-100
  contract_renewal_risk: "low" | "medium" | "high";
}
```

**Sponsor sensitivity:**
- DraftKings: High (0.35 β)
- Adidas: Low (0.08 β)
- Nike: Negative (-0.12 β, inverse relationship)

---

### CSE-E: Compliance & Stability Factor

**Raw inputs:**
- League disciplinary actions
- Contract status (active, suspended, terminated)
- Legal/regulatory events
- Injury confirmation status
- League communication

**Output:**
```typescript
interface CSEEFactor {
  compliance_score: number;    // 0-1 (1 = fully compliant)
  stability_indicator: number; // 0-1 (1 = stable)
  event_type: string;          // "none" | "injury" | "suspension" | etc.
  source_count: number;        // Number of confirming sources
  validation_status: "unvalidated" | "one_source" | "validated" | "rejected";
}
```

---

## Normalization Methodology

### 1. Z-Score Normalization

```typescript
zscore = (value - mean) / stddev
```

Window: Rolling 30-day athlete-specific baseline.

### 2. Percentile Ranking

```typescript
percentile = (# values below score / total values) * 100
```

Window: Rolling 60-day cross-athlete population.

### 3. Volatility Adjustment

```typescript
vol_adjusted_delta = raw_delta / realized_vol
```

This normalizes for market regimes (stable vs. unstable).

### 4. Cross-Athlete Harmonization

Ensure factors are comparable across athletes despite different baseline characteristics:

```typescript
harmonized = (athlete_value - athlete_mean) / athlete_stddev
```

### 5. Cross-Sport Harmonization

Normalize across sports (football, basketball, etc.):

```typescript
cross_sport_normalized = sport_adjustment_factor * athlete_normalized
```

Adjustment factors pre-computed from historical correlations.

---

## Integration with Risk Engine

The Factor Library feeds directly into the CRS Engine:

```
Raw Athlete Signals
        ↓
[Factor Library]
        ↓
Normalized BLEI-E Factors (PMF-E, SEF-E, etc.)
        ↓
[CRS Engine]
        ↓
Composite Risk Score (CRS)
        ↓
Risk States (0-4)
        ↓
Hedge Actions & Portfolio Overlays
```

---

## API Examples

### TypeScript

```typescript
import { FactorFactory, PMFEFactor, SEFEFactor } from '@drb-apes/blei-e-factors';

const factory = new FactorFactory();

// Create PMF-E factor
const pmfFactor = factory.createPMFE({
  raw_performance_delta: 2.5,  // +2.5% change
  athlete_id: 'athlete_123',
  timestamp: Date.now(),
});

console.log(pmfFactor.zscore);        // -0.42 (below average)
console.log(pmfFactor.percentile);    // 33 (33rd percentile)

// Create SEF-E factor
const sefFactor = factory.createSEFE({
  sentiment_score: 0.68,  // Positive
  mentions_count: 15000,
  athlete_id: 'athlete_123',
  timestamp: Date.now(),
});

console.log(sefFactor.sentiment_zscore);  // 1.2
```

### Python

```python
from blei_e_factors import FactorFactory

factory = FactorFactory()

# Create VVE-E (Virality & Visibility)
vve_factor = factory.create_vve_e(
    virality_velocity=450,  # 450 mentions/hour
    athlete_id='athlete_123',
    timestamp=int(time.time() * 1000)
)

print(f"Virality percentile: {vve_factor['visibility_percentile']}")  # 87
print(f"Trend: {vve_factor['trend_direction']}")  # "accelerating"
```

---

## Testing

```bash
# TypeScript tests
npm test

# Python tests
python -m pytest blei_e_factors/

# Cross-language integration
npm run test:integration
```

---

## Documentation

- **[Factor Definitions Deep Dive](./docs/FACTOR_DEFINITIONS.md)**
- **[Normalization Specification](./docs/NORMALIZATION_SPEC.md)**
- **[Integration Guide](./docs/INTEGRATION_GUIDE.md)**
- **[API Reference](./docs/API_REFERENCE.md)**
- **[Examples](./docs/EXAMPLES.md)**

---

## Licensing & Distribution

**Private npm:**
```bash
npm publish --registry https://npm.your-institution.com/
```

**Private PyPI:**
```bash
python setup.py upload -r institutional
```

**License:** Apache 2.0

---

## Support

For issues, questions, or integration requests, contact the BLEI-E platform team.
