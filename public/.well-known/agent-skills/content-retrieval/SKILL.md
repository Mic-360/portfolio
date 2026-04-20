---
name: content-retrieval
description: Retrieve structured portfolio content from bhaumicsingh.dev including blog posts, project case studies, professional certificates, and Gravatar profile data. Use when you need to fetch, search, or reference any published content from this site.
---

# Content Retrieval

Retrieve blog posts, project case studies, certificates, and profile information from bhaumicsingh.dev. All read endpoints are public and require no authentication.

## Endpoints

### GET /api/certificates

Return all professional certificates with metadata.

**Example request:**
```
GET https://bhaumicsingh.dev/api/certificates
Accept: application/json
```

**Example response:**
```json
{
  "status": "ok",
  "data": [
    {
      "title": "AWS Solutions Architect",
      "slug": "aws-solutions-architect",
      "issued": "2024-01-15",
      "issuer": "Amazon Web Services",
      "image_url": "https://..."
    }
  ],
  "timestamp": "2026-04-20T00:00:00.000Z"
}
```

### GET /api/gravatar/{identifier}

Fetch a Gravatar profile by email hash or username. The response is cached for 6 hours at the CDN level.

**Example request:**
```
GET https://bhaumicsingh.dev/api/gravatar/bhaumic
Accept: application/json
```

### GET /llms-full.txt

Full structured site context optimized for LLM consumption. Includes identity, expertise, social links, blog index, project index, and certificates with direct URLs.

### GET /llms.txt

Short site context summary — use this when you only need a quick overview.

## Content Pages

Every page on the site supports markdown content negotiation. Send `Accept: text/markdown` to get clean markdown instead of HTML:

```
GET https://bhaumicsingh.dev/blog/my-post
Accept: text/markdown
```

The response includes an `x-markdown-tokens` header with the estimated token count.

## Error Handling

All endpoints return JSON error responses with `status: "error"` and a descriptive `message` field. HTTP status codes follow standard conventions (404 for not found, 500 for server errors).
