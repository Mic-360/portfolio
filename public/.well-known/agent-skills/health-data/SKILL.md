---
name: health-data
description: Access real-time health and fitness metrics from bhaumicsingh.dev including steps, heart rate, sleep, SpO2, distance, and energy data. Use when you need to fetch, analyze, or display health telemetry from this site's Apple Health integration.
---

# Health Data

Access real-time health and fitness metrics synced from Apple Health. Data includes steps, heart rate, sleep analysis, SpO2, walking distance, active energy, and resting energy — each with computed stats and daily aggregates.

## Endpoints

### GET /api/health

Retrieve all health metrics with computed statistics and daily aggregates.

**Example request:**
```
GET https://bhaumicsingh.dev/api/health
Accept: application/json
```

**Example response:**
```json
{
  "status": "ok",
  "data": {
    "steps": {
      "stats": { "min": 0, "max": 15234, "avg": 7821.5, "total": 54750 },
      "dailyAggregates": [
        { "date": "2026-04-19", "value": 8432 }
      ],
      "raw": [...]
    },
    "heartRate": {
      "stats": { "min": 52, "max": 142, "avg": 72.3 },
      "dailyAggregates": [...],
      "raw": [...]
    },
    "sleep": {
      "count": 7,
      "raw": [...]
    },
    "updatedAt": "2026-04-20T04:00:00.000Z"
  },
  "timestamp": "2026-04-20T04:30:00.000Z"
}
```

**Available metric categories:** `steps`, `activeEnergy`, `restingEnergy`, `distance`, `spO2`, `heartRate`, `sleep`

Each category (except sleep) includes:
- `stats` — min, max, avg, and total (where applicable)
- `dailyAggregates` — values aggregated by day (sum for cumulative metrics, avg for rate metrics)
- `raw` — individual data points with timestamps

### POST /api/health

Update health data. Requires the `x-api-key` header.

**Example request:**
```
POST https://bhaumicsingh.dev/api/health
Content-Type: application/json
x-api-key: <your-api-key>

{
  "steps": [{ "date": "2026-04-20", "qty": 8432 }],
  "heartRate": [{ "date": "2026-04-20T10:30:00Z", "qty": 72 }]
}
```

**Success response:** `{ "status": "success", "message": "Health data updated" }`

## Authentication

| Method | Auth Required |
|--------|--------------|
| GET    | None         |
| POST   | `x-api-key` header |

## Error Handling

- `400` — invalid payload on POST
- `401` — missing API key
- `403` — invalid API key
- `500` — server error fetching data
