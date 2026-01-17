import { Link } from '@tanstack/react-router'
import ThemeToggle from './ThemeToggle'

const navItems = [
  { label: 'home', to: '/' },
  { label: 'blog', to: '/blog/' },
  { label: 'projects', to: '/projects/' },
  {
    label: 'resume',
    to: '/resume.pdf',
    external: true,
  },
]

export default function Header() {
  return (
    <header className="mx-auto w-full max-w-2xl px-2 pt-8 border-b border-border pb-4 mb-2">
      <div className="flex items-center justify-between gap-4">
        <nav className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary">
          {navItems.map((item) =>
            item.external ? (
              <a
                key={item.label}
                href={item.to}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md px-2 py-1 transition hover:text-primary/80"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-md px-2 py-1 transition hover:text-primary/80"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>
        <div className="flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
