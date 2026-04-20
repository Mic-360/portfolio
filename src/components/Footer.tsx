import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'

import GithubIcon from './ui/github-icon'
import InstagramIcon from './ui/instagram-icon'
import LinkedinIcon from './ui/linkedin-icon'
import TwitterIcon from './ui/twitter-icon'

import { gravatar, siteInfo, socialLinks } from '@/config/site-data'

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
    <footer className="relative mx-auto w-full max-w-395 py-8 lowercase">
      <div className="relative overflow-hidden pt-12 px-8">
        <div className="pointer-events-none absolute inset-x-[14%] top-[8%] h-24 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[18%] h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />

        <div className="pointer-events-none absolute inset-y-0 right-[-4%] w-[34%]">
          <img
            src="/frieren/team.svg"
            alt=""
            aria-hidden="true"
            className="hero-blend-media absolute inset-0 h-full w-full object-contain object-center sm:object-bottom opacity-30"
          />
          <div className="absolute inset-0 bg-linear-to-l from-background/10 via-background/62 to-background" />
          <div className="absolute inset-y-0 right-[-8%] w-[34%] bg-linear-to-l from-background via-background/84 to-transparent blur-2xl" />
        </div>

        <div className="relative z-10 grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.6fr)] lg:items-end">
          <div className="grid gap-8">
            <div className="grid gap-5">
              <h2 className="max-w-4xl font-serif text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                The work can end here, or this can be the point where we start
                building together.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-foreground/70 sm:text-lg">
                Open the public profile, scan the QR, or jump into the build
                trail.
              </p>
            </div>

            <div className="h-px w-full bg-border/15" />

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[10px] tracking-[0.2em] text-muted-foreground/70">
              <span>MIT licensed</span>
              <span>built with TanStack Start</span>
              <Link to="/rss" className="transition-colors hover:text-primary">
                rss
              </Link>
            </div>
          </div>

          <div className="grid gap-8 lg:justify-self-end lg:text-right">
            <motion.a
              href="/about"
              rel="noopener noreferrer me"
              title="Scan to open the Gravatar profile"
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="group flex items-end justify-between gap-5 lg:justify-end"
            >
              <div className="grid gap-1.5 text-left lg:text-right">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  scan profile
                </p>
                <p className="text-sm leading-7 text-foreground/70">
                  Open the public identity card and verified links.
                </p>
              </div>
              <img
                src={gravatar.qrCodeUrl}
                alt="Gravatar QR code"
                width={84}
                height={84}
                className="h-18 w-18 shrink-0 rounded-2xl border border-border/15 bg-background/30 p-1.5 transition-transform duration-500 ease-out group-hover:scale-105"
              />
            </motion.a>

            <ul className="flex flex-wrap items-center gap-5 lg:justify-end">
              <li>
                <Link
                  to="/rss"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-foreground/40 transition-colors duration-300 hover:text-primary"
                  aria-label="rss"
                >
                  <RssIcon />
                </Link>
              </li>
              {socialLinks
                .filter((link) => link.label !== 'rss')
                .map((link) => {
                  const Icon = iconMap[link.label as keyof typeof iconMap]

                  return (
                    <li key={link.label}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer me"
                        className="flex items-center gap-2 text-foreground/40 transition-colors duration-300 hover:text-primary"
                        aria-label={link.label}
                      >
                        <Icon size={18} className="text-current" />
                      </a>
                    </li>
                  )
                })}
            </ul>

            <p className="text-[10px] tracking-[0.2em] text-muted-foreground/70 lg:justify-self-end">
              {siteInfo.name} · {siteInfo.currentRole}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
