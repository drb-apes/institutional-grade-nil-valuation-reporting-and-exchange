# Model NIL + Risk Engine

## Model NIL

```ts
const modelNil =
  baseValue +
  performance * 18000 +
  sponsorshipFit * 12000 +
  biometricComponent * 120 +
  socialDemand +
  mediaVelocity * 5000 -
  fatiguePenalty -
  riskDiscount -
  volatilityPenalty;
```

## Risk score

```ts
const score =
  0.3 * latencyRisk +
  0.25 * dwellTimeRisk +
  0.2 * engagementDropRisk +
  0.15 * spendShock +
  0.1 * athleteOutputShock;
```

## CRS logic

```ts
if (score >= 1.3) return 'CRS-3';
if (score >= 0.9) return 'CRS-2';
if (score >= 0.55) return 'CRS-1';
return 'CRS-0';
```

## Exposure actions

- CRS-0: continue monetization
- CRS-1: throttle spend
- CRS-2: hedge exposure and reprice yield
- CRS-3: freeze campaign activity and route capital to cash equivalents
