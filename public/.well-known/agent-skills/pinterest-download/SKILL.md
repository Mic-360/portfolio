---
name: pinterest-download
description: Download Pinterest images via a server-side proxy on bhaumicsingh.dev. Use when you need to fetch Pinterest images without CORS restrictions, hotlink blocking, or client-side limitations. Only accepts i.pinimg.com URLs for security.
---

# Pinterest Image Download

Download Pinterest images through a server-side proxy that bypasses CORS and hotlink restrictions. The proxy validates that URLs point to `i.pinimg.com` and returns the image as a downloadable attachment.

## Endpoint

### GET /api/pinterest/download

Fetch and proxy a Pinterest image.

**Parameters:**

| Parameter  | Required | Description                                    |
| ---------- | -------- | ---------------------------------------------- |
| `image`    | Yes      | HTTPS URL from `i.pinimg.com`                  |
| `fallback` | No       | Alternate Pinterest image URL if primary fails |
| `name`     | No       | Desired filename (default: `pinterest-image`)  |

**Example request:**

```
GET https://bhaumicsingh.dev/api/pinterest/download?image=https://i.pinimg.com/originals/ab/cd/ef.jpg&name=my-pin
```

**Success response:**

```
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Disposition: attachment; filename="my-pin.jpg"
Cache-Control: no-store
```

Body contains the raw image bytes.

**Supported image formats:** JPEG, PNG, WebP, GIF, AVIF

## Security

- Only `https://i.pinimg.com` URLs are accepted — all other domains are rejected with HTTP 400
- Filenames are sanitized (alphanumeric, dots, hyphens only, max 120 chars)
- Upstream fetches have a 7-second timeout

## Error Handling

- `400` — no valid Pinterest image URL provided
- `502` — upstream Pinterest server is unreachable or returned an error

## Authentication

No authentication required.
