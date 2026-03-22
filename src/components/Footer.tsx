import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import GithubIcon from './ui/github-icon'
import InstagramIcon from './ui/instagram-icon'
import LinkedinIcon from './ui/linkedin-icon'
import TwitterIcon from './ui/twitter-icon'

import { gravatar, socialLinks } from '@/config/site-data'

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
    <footer className="relative mx-auto w-full max-w-2xl p-4 text-sm text-primary">
      {/* Animus-style Separator */}
      <div className="animus-divider mb-6">
        <span className="diamond" />
      </div>

      <ul className="flex flex-wrap items-center gap-4 lowercase justify-center">
        <li>
          <motion.div
            whileHover={{ y: -3, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Link
              to="/rss"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary transition hover:text-primary/80"
              aria-label="rss"
            >
              <RssIcon />
            </Link>
          </motion.div>
        </li>
        {socialLinks
          .filter((link) => link.label !== 'rss')
          .map((link) => {
            const Icon = iconMap[link.label as keyof typeof iconMap]

            return (
              <li key={link.label}>
                <motion.a
                  href={link.url}
                  target={link.url.startsWith('http') ? '_blank' : undefined}
                  rel={
                    link.url.startsWith('http')
                      ? 'noopener noreferrer me'
                      : undefined
                  }
                  whileHover={{ y: -3, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                  className="flex items-center gap-2 text-primary transition hover:text-primary/80"
                  aria-label={link.label}
                >
                  <Icon size={20} className="text-primary" />
                </motion.a>
              </li>
            )
          })}
      </ul>
      <div className="mt-6 flex items-end justify-between gap-4">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
          © {new Date().getFullYear()} mit licensed · built with TanStack Start
          ·{' '}
          <a
            href={gravatar.profileUrl}
            target="_blank"
            rel="noopener noreferrer me"
            className="hover:text-primary transition-colors"
          >
            gravatar
          </a>
        </p>
        <motion.a
          href={'/about'}
          className="shrink-0"
          title="Scan to view Gravatar profile"
          whileHover={{ scale: 1.05 }}
        >
          <img
            src={gravatar.qrCodeUrl}
            alt="Gravatar QR Code"
            width={56}
            height={56}
            className="rounded-md opacity-60 hover:opacity-100 transition-opacity"
          />
        </motion.a>
      </div>
    </footer>
  )
}
