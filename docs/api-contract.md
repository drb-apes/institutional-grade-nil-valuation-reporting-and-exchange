# API Contract

## Track A

### GET /api/v1/track-a/athletes/:id/divergence

#### Response

```json
{
  "athleteId": 1,
  "athleteName": "Ava Thompson",
  "modelNil": 58263.31,
  "marketNil": 42000,
  "divergence": 16263.31,
  "spreadPercent": 38.72
}
```

### POST /api/v1/track-a/orders

Request:

```json
{
  "athleteId": 1,
  "side": "buy",
  "quantity": 10,
  "pricePerUnit": 40,
  "userId": "u_123"
}
```

Response:

```json
{
  "orderId": "ord_1001",
  "status": "filled",
  "grossValue": 400
}
```

## Track B

### GET /api/v1/track-b/campaigns/:id/summary

```json
{
  "id": 42,
  "sponsor": "NorthPeak Energy",
  "principal": 500000,
  "revenueSweepPercent": 10,
  "apy": 18.4,
  "crs": "CRS-0",
  "activeTranches": 3,
  "capitalSecured": 265000
}
```

### POST /api/v1/track-b/tranches/purchase

Request:

```json
{
  "userId": "u_123",
  "campaignId": 42,
  "trancheId": "T-2",
  "units": 1000,
  "unitPrice": 1
}
```

Response:

```json
{
  "purchaseId": "p_751",
  "status": "confirmed",
  "units": 1000,
  "costBasis": 1000
}
```
