---
name: blog-feed
description: Subscribe to and retrieve blog posts from bhaumicsingh.dev via RSS 2.0 feed, structured sitemap, or direct page access with markdown negotiation. Use when you need to monitor, fetch, or aggregate blog content from this site.
---

# Blog Feed

Subscribe to and retrieve blog posts via multiple formats. The blog covers web development, Android, cloud infrastructure, and AI experimentation.

## Endpoints

### GET /rss

Full RSS 2.0 feed with `content:encoded` for complete post content inline.

**Example request:**
```
GET https://bhaumicsingh.dev/rss
Accept: application/xml
```

**Response format:** RSS 2.0 XML with Atom self-link. Each `<item>` includes:
- `<title>` — post title
- `<link>` — canonical URL
- `<description>` — post summary
- `<pubDate>` — publication date (RFC 2822)
- `<author>` — author email and name
- `<content:encoded>` — full HTML content

### GET /blog

Browse all blog posts. Supports content negotiation:

```
GET https://bhaumicsingh.dev/blog
Accept: text/markdown
```

Returns clean markdown with `x-markdown-tokens` header when `Accept: text/markdown` is sent. Default is HTML.

### GET /blog/{slug}

Read an individual blog post by its URL slug.

**Example:**
```
GET https://bhaumicsingh.dev/blog/building-portfolio-with-tanstack
Accept: text/markdown
```

### GET /sitemap.xml

XML sitemap listing all blog post URLs with `<lastmod>` dates and `<image:image>` tags for OG images.

```
GET https://bhaumicsingh.dev/sitemap.xml
Accept: application/xml
```

## Discovery

Find available blog posts by:
1. Parsing the RSS feed for the latest entries
2. Checking `/llms-full.txt` for a complete blog index with URLs
3. Parsing `/sitemap.xml` for all published URLs

## Authentication

All blog endpoints are public. No authentication required.
