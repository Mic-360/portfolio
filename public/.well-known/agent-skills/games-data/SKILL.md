---
name: games-data
description: Retrieve and update gaming library data from bhaumicsingh.dev. Use when you need to fetch game metadata, check gaming activity, or update the games collection via the API.
---

# Games Data

Retrieve and manage the gaming library. Returns game metadata including titles, platforms, playtime, and status.

## Endpoints

### GET /api/games

Retrieve the full games collection.

**Example request:**

```
GET https://bhaumicsingh.dev/api/games
Accept: application/json
```

**Example response:**

```json
{
  "status": "ok",
  "data": [
    {
      "title": "Horizon Forbidden West",
      "platform": "PS5",
      "status": "completed",
      "rating": 9.5
    }
  ],
  "timestamp": "2026-04-20T00:00:00.000Z"
}
```

### POST /api/games

Add or update games in the collection. Accepts a single game object or an array. Requires the `x-api-key` header.

**Example request:**

```
POST https://bhaumicsingh.dev/api/games
Content-Type: application/json
x-api-key: <your-api-key>

[
  { "title": "Elden Ring", "platform": "PC", "status": "playing" }
]
```

**Success response:**

```json
{
  "status": "success",
  "message": "Games data updated",
  "data": [...]
}
```

## Authentication

| Method | Auth Required      |
| ------ | ------------------ |
| GET    | None               |
| POST   | `x-api-key` header |

## Error Handling

- `400` — invalid payload on POST
- `401` — missing API key
- `403` — invalid API key
- `500` — server error fetching data
