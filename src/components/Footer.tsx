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
    <footer className="relative mx-auto w-full max-w-[1500px] px-4 pb-8 pt-6 sm:px-6 lg:px-16">
      <div className="relative overflow-hidden border-t border-border/20 pt-8">
        <div className="pointer-events-none absolute inset-x-[14%] top-[8%] h-24 rounded-full bg-primary/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[18%] h-72 w-72 rounded-full bg-primary/10 blur-[120px]" />

        <div className="pointer-events-none absolute inset-y-0 right-[-4%] w-[34%]">
          <img
            src="/frieren/team.svg"
            alt=""
            aria-hidden="true"
            className="hero-blend-media absolute inset-0 h-full w-full object-contain object-center sm:object-bottom opacity-40"
          />
          <div className="absolute inset-0 bg-linear-to-l from-background/10 via-background/62 to-background" />
          <div className="absolute inset-y-0 right-[-8%] w-[34%] bg-linear-to-l from-background via-background/84 to-transparent blur-2xl" />
        </div>

        <div className="hero-grid-overlay absolute inset-y-[10%] right-[2%] hidden w-[34%] md:block" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[minmax(0,0.94fr)_minmax(280px,0.68fr)] lg:items-end">
          <div className="grid gap-6">
            <div className="grid gap-4">
              <h2 className="max-w-5xl font-serif text-4xl leading-none text-foreground sm:text-5xl lg:text-6xl">
                The work can end here, or this can be the point where we start
                building together.
              </h2>
              <p className="max-w-3xl text-base leading-8 text-foreground/78 sm:text-lg">
                Open the public profile, scan the QR, or jump into the build
                trail.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              <span>MIT licensed</span>
              <span>built with TanStack Start</span>
              <Link to="/rss" className="transition-colors hover:text-primary">
                rss
              </Link>
            </div>
          </div>

          <div className="grid gap-6 lg:justify-self-end lg:text-right">
            <motion.a
              href="/about"
              rel="noopener noreferrer me"
              title="Scan to open the Gravatar profile"
              whileHover={{ y: -3 }}
              transition={{ duration: 0.25 }}
              className="group flex items-end justify-between gap-5 border-b border-border/25 pb-4 lg:justify-end"
            >
              <div className="grid gap-1 text-left lg:text-right">
                <p className="text-[10px] uppercase tracking-[0.28em] text-primary/75">
                  scan profile
                </p>
                <p className="text-sm leading-7 text-foreground/72">
                  Open the public identity card and verified links.
                </p>
              </div>
              <img
                src={gravatar.qrCodeUrl}
                alt="Gravatar QR code"
                width={84}
                height={84}
                className="h-20 w-20 shrink-0 rounded-xl border border-border/25 bg-background/40 p-1.5 transition-transform duration-300 group-hover:scale-105"
              />
            </motion.a>

            <ul className="flex flex-wrap items-center gap-4 lg:justify-end">
              <li>
                <motion.div
                  whileHover={{ y: -3, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 380, damping: 16 }}
                >
                  <Link
                    to="/rss"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-foreground/72 transition-colors hover:text-primary"
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
                        target="_blank"
                        rel="noopener noreferrer me"
                        whileHover={{ y: -3, scale: 1.05 }}
                        transition={{
                          type: 'spring',
                          stiffness: 380,
                          damping: 16,
                        }}
                        className="flex items-center gap-2 text-foreground/72 transition-colors hover:text-primary"
                        aria-label={link.label}
                      >
                        <Icon size={20} className="text-current" />
                      </motion.a>
                    </li>
                  )
                })}
            </ul>

            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground lg:justify-self-end">
              {siteInfo.name} · {siteInfo.currentRole}
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
