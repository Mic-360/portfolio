---
name: og-images
description: Generate dynamic Open Graph images from bhaumicsingh.dev for blog posts, projects, and the homepage. Use when you need social sharing preview images, thumbnails, or visual representations of site content.
---

# OG Image Generation

Generate dynamic Open Graph images sized for social media sharing (1200×630 PNG). Images are rendered server-side using Satori and resvg with custom typography and layouts.

## Endpoints

### GET /og/blog/{slug}

Generate an OG image for a specific blog post. The image includes the post title, date, and site branding.

**Example request:**
```
GET https://bhaumicsingh.dev/og/blog/building-portfolio-with-tanstack
```

**Response:**
```
Content-Type: image/png
```

### GET /og/projects/{slug}

Generate an OG image for a specific project case study.

**Example request:**
```
GET https://bhaumicsingh.dev/og/projects/zorvyn
```

### GET /og/home

Generate the homepage OG image with site branding and tagline.

**Example request:**
```
GET https://bhaumicsingh.dev/og/home
```

## Discovery

Find valid slugs for blog posts and projects by:
1. Parsing `/llms-full.txt` for the complete content index
2. Parsing `/sitemap.xml` for all published URLs
3. Fetching `/rss` for the latest blog posts

## Image Specs

| Property | Value |
|----------|-------|
| Width    | 1200px |
| Height   | 630px |
| Format   | PNG |
| Renderer | Satori + @resvg/resvg-js |

## Error Handling

- `404` — slug not found (no matching blog post or project)
- `500` — render error

## Authentication

No authentication required.
