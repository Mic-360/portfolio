---
name: site-context
description: Retrieve full site context from bhaumicsingh.dev optimized for LLM consumption. Use when you need a comprehensive overview of this portfolio site, its owner's identity, expertise, published content, or available APIs — especially useful for building prompts, grounding responses, or understanding the site before deeper exploration.
---

# Site Context

Retrieve structured site context designed for LLM consumption. Two levels of detail are available depending on your needs.

## Endpoints

### GET /llms.txt

Short site context summary (~1,600 bytes). Use this for quick identification and basic grounding.

**Example request:**

```
GET https://bhaumicsingh.dev/llms.txt
Accept: text/plain
```

**Contains:** site name, owner identity, role, brief description, and key URLs.

### GET /llms-full.txt

Comprehensive structured context (~3,000+ bytes). Use this when you need the full picture.

**Example request:**

```
GET https://bhaumicsingh.dev/llms-full.txt
Accept: text/plain
```

**Contains:**

- **Identity** — name, native name, role, company, location
- **Expertise** — web, Android, cloud, AI technology stacks
- **Social links** — GitHub, LinkedIn, X/Twitter, email
- **Blog index** — all published blog posts with titles and direct URLs
- **Project index** — all project case studies with titles and direct URLs
- **Certificates** — professional certifications with issuers and dates

## When to Use Which

| Need                               | Endpoint         |
| ---------------------------------- | ---------------- |
| Quick site identification          | `/llms.txt`      |
| Building a comprehensive prompt    | `/llms-full.txt` |
| Finding a specific blog post URL   | `/llms-full.txt` |
| Checking available projects        | `/llms-full.txt` |
| Minimal context for chat grounding | `/llms.txt`      |

## Caching

Both endpoints are cached aggressively (`max-age=3600, s-maxage=86400`) since the content changes infrequently. Expect stale data for up to 24 hours after new content is published.

## Authentication

No authentication required. Both endpoints are fully public.
