import { socialLinks } from '@/lib/site-data'
import { Link } from '@tanstack/react-router'
import GithubIcon from './ui/github-icon'
import InstagramIcon from './ui/instagram-icon'
import LinkedinIcon from './ui/linkedin-icon'
import TwitterIcon from './ui/twitter-icon'

const iconMap = {
  github: GithubIcon,
  instagram: InstagramIcon,
  linkedin: LinkedinIcon,
  x: TwitterIcon,
}

function RssIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M4 11a9 9 0 0 1 9 9" />
      <path d="M4 4a16 16 0 0 1 16 16" />
      <circle cx="5" cy="19" r="1" fill="currentColor" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="mx-auto w-full max-w-2xl px-4 pb-12 pt-12 text-sm text-primary">
      <ul className="flex flex-wrap gap-4 lowercase">
        <li>
          <Link
            to="/rss"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary transition hover:text-primary/80"
            aria-label="rss"
          >
            <RssIcon />
          </Link>
        </li>
        {socialLinks
          .filter((link) => link.label !== 'rss')
          .map((link) => {
            const Icon = iconMap[link.label as keyof typeof iconMap]
            if (!Icon) return null

            return (
              <li key={link.label}>
                <a
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : undefined}
                  rel={
                    link.url.startsWith('http')
                      ? 'noopener noreferrer'
                      : undefined
                  }
                  className="flex items-center gap-2 text-primary transition hover:text-primary/80"
                  aria-label={link.label}
                >
                  <Icon size={20} className="text-primary" />
                </a>
              </li>
            )
          })}
      </ul>
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        © {new Date().getFullYear()} mit licensed · built with TanStack Start
      </p>
    </footer>
  )
}
