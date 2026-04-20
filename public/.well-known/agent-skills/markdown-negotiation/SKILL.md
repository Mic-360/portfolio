---
name: markdown-negotiation
description: Request any page on bhaumicsingh.dev as clean markdown by sending Accept text/markdown. Use when you need to extract readable content from any page on this site without parsing HTML, or when you want to minimize token usage by getting structured markdown instead of raw HTML.
---

# Markdown Negotiation

Request any HTML page as clean, structured markdown by including `Accept: text/markdown` in your request headers. This strips navigation, scripts, SVGs, forms, and other non-content elements, returning only the semantic page content.

## Usage

Send a standard HTTP GET with the Accept header:

**Example request:**
```
GET https://bhaumicsingh.dev/blog/my-post HTTP/1.1
Accept: text/markdown
```

**Response headers:**
```
Content-Type: text/markdown; charset=utf-8
x-markdown-tokens: 1842
Vary: Accept
Content-Signal: ai-train=yes, search=yes, ai-input=yes
```

The `x-markdown-tokens` header provides an estimated token count (approximately 4 characters per token) so you can budget context window usage before reading the body.

## What Gets Stripped

The converter removes these non-content elements:
- `<script>`, `<style>`, `<noscript>` tags
- `<nav>`, `<footer>` elements
- `<svg>`, `<iframe>`, `<video>`, `<audio>`, `<canvas>` embeds
- `<form>`, `<button>` interactive elements
- Elements with `aria-hidden="true"`

## When to Use

- **Reading blog posts or project pages** — get the content without layout markup
- **Indexing the entire site** — combine with `/sitemap.xml` to crawl all pages as markdown
- **Context building** — use `x-markdown-tokens` to estimate cost before fetching
- **Comparing with `/llms-full.txt`** — the LLMs context file gives a pre-built summary, while markdown negotiation gives you the live page content

## Scope

Works on any route that returns `text/html` with HTTP 200. Static assets (images, JSON, XML) are unaffected. If the page returns a non-200 status, the original response passes through unchanged.

## Authentication

No authentication required. All pages are publicly accessible.
