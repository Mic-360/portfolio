<p align="center">
  <img src="public/icon.svg" alt="Bhaumic Singh" />
</p>

<h1 align="center">bhaumicsingh.dev</h1>

<p align="center">
  A high-performance personal portfolio built with <strong>TanStack Start</strong>, featuring health tracking, Pinterest integration, certificate showcase, GitHub activity heatmap, and a command palette — all wrapped in a dark-first, anime-inspired design.
</p>

<p align="center">
  <a href="https://bhaumicsingh.dev">Live Site</a> &middot;
  <a href="https://bhaumicsingh.dev/rss">RSS Feed</a> &middot;
  <a href="https://bhaumicsingh.dev/readme">README Page</a>
</p>

---

## Tech Stack

| Layer          | Tech                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| **Framework**  | [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router) |
| **Styling**    | [Tailwind CSS v4](https://tailwindcss.com/) with CSS custom properties    |
| **Content**    | MDX via unified/remark/rehype + `gray-matter`                             |
| **Animations** | [Motion](https://motion.dev/) (formerly Framer Motion)                    |
| **Runtime**    | [Nitro](https://nitro.unjs.io/) via TanStack Start                        |
| **Validation** | [Zod](https://zod.dev/)                                                   |
| **OG Images**  | Dynamic SVG generation with `@resvg/resvg-js`                             |
| **Search**     | Command palette via `cmdk`                                                |

## Features

- **SSR** — Server-side rendering for fast loads and SEO
- **Three Theme Modes** — Normal (dark), Sunny, and Midnight with animated transitions
- **Health Dashboard** — Apple Health data synced via iPhone Shortcut to `/api/health`, visualized with sparkline charts
- **GitHub Heatmap** — 2-year contribution history with responsive month range via `cal-heatmap`
- **Pinterest Gallery** — Auto-fetched created pins displayed in a masonry layout
- **Certificate Showcase** — Professional certifications with LinkedIn credential images and structured data
- **Gravatar Integration** — Profile card, avatar, and social links pulled from Gravatar API
- **Blog & Projects** — MDX-powered content with syntax highlighting and reading time
- **Dynamic OG Images** — Per-page social sharing images generated at build time
- **Command Palette** — Quick navigation with keyboard shortcut
- **Floating Dock** — macOS-style navigation dock with magnification effect
- **F1 Roadmap** — Previous work experience displayed as an animated 3D race circuit
- **RSS Feed** — Auto-generated feed for blog posts
- **Sitemap** — Dynamic XML sitemap for search engines

## Pages

| Route                | Description                                                                                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| `/`                  | Home — profile, experience roadmap, blogs, projects, certificates, health stats, GitHub heatmap, Pinterest |
| `/about`             | Extended bio                                                                                               |
| `/blog`              | Blog index and individual posts (`/blog/:slug`)                                                            |
| `/projects`          | Project index and detail pages (`/projects/:slug`)                                                         |
| `/certificates`      | Certificate gallery and detail pages (`/certificates/:slug`)                                               |
| `/pinterest/gallery` | Full Pinterest created pins gallery                                                                        |
| `/resume`            | Resume viewer                                                                                              |
| `/readme`            | GitHub-style README page                                                                                   |
| `/bento`             | Bento grid layout                                                                                          |
| `/rss`               | RSS feed                                                                                                   |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+

### Install & Run

```bash
git clone https://github.com/Mic-360/portfolio.git
cd portfolio
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Build

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  routes/          File-based routing (pages + API endpoints)
  components/      React components (heatmap, dock, roadmap, etc.)
  config/          Site metadata, social links, theme config
  content/         MDX blog posts, projects, certificates, health data
  lib/             Server functions, utilities, API integrations
  styles.css       Tailwind v4 theme and global styles
public/            Static assets (icon.svg, images, SVGs)
```

## License

[MIT](./LICENSE) — Built by [Bhaumic Singh](https://bhaumicsingh.dev)
