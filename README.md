# Bhaumic Singh — Portfolio

A minimalist, high-performance personal portfolio built with the bleeding edge **TanStack Start** (SSR) ecosystem. It features a typesafe routing system, MDX-powered content, and a sleek dark-first design.

## 🚀 Tech Stack

- **Framework**: [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Content**: [MDX](https://mdxjs.com/) with `gray-matter` for blog posts and projects
- **Theming**: Native CSS Variables with Dark/Light mode persistence
- **Animations**: [Motion](https://motion.dev/) (formerly Framer Motion)
- **Runtime**: [Nitro](https://nitro.unjs.io/) (via TanStack Start)
- **Validation**: [Zod](https://zod.dev/) & [T3 Env](https://env.t3.gg/)

## ✨ Features

- **SSR (Server-Side Rendering)**: Fast initial loads and SEO friendly out of the box.
- **Dark-First Design**: Optimized for a dark aesthetic with a persistent theme toggle.
- **Typesafe Routing**: 100% typesafe links and parameters powered by TanStack Router.
- **MDX Content**: Write blog posts and project details in Markdown with React component support.
- **Localized Content**: Prepared for multi-language support (i18n).
- **Automated RSS**: Built-in RSS feed generation for blog posts.

## 🛠️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Mic-360/portfolio.git

# Install dependencies
yarn install
```

### Development

```bash
# Start the development server
yarn dev
```

The app will be available at `http://localhost:3000`.

### Building for Production

```bash
yarn build
yarn preview
```

## 📂 Project Structure

- `src/routes/`: File-based routing system.
- `src/components/`: Reusable React components.
- `src/content/`: MDX files for blog posts and projects.
- `src/lib/`: Core logic, site data, and utility functions.
- `src/styles.css`: Tailwind v4 configuration and global styles.

## 📝 License

This project is [MIT](./LICENSE) licensed. Built with ❤️ by [Bhaumic Singh](https://bhaumicsingh.dev).
