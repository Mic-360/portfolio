import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useRef, useState } from 'react'

import type { CertificateMeta } from '@/lib/certificates'
import type { BlogMeta, ProjectMeta } from '@/lib/content'
import type { HealthSample } from '@/lib/health'
import type { PinterestCreatedPin } from '@/lib/pinterest'

import { getCertificateIndex } from '@/lib/certificates'
import { getBlogIndex, getProjectIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { getGamesData } from '@/lib/games'
import { hashEmail } from '@/lib/gravatar'
import { getGravatarProfile } from '@/lib/gravatar-profile'
import { getHealthData } from '@/lib/health'
import { getPinterestCreatedPins } from '@/lib/pinterest'

import { KeyboardHint } from '@/components/CommandMenu'
import { MetricRow, Section } from '@/components/functions'
import { GamesCinematic } from '@/components/GamesCinematic'
import GitHubHeatmap from '@/components/GitHubHeatmap'
import GravatarAvatar from '@/components/gravatar/GravatarAvatar'
import GravatarSocialLinks from '@/components/gravatar/GravatarSocialLinks'
import { PreviousRoadmap } from '@/components/PreviousRoadmap'
import CalendarIcon from '@/components/ui/calendar-icon'
import CurrentIcon from '@/components/ui/current-icon'
import PreviousIcon from '@/components/ui/previous-icon'
import { gravatarConfig } from '@/config/gravatar'
import {
  contactLinks,
  gravatar,
  pinterest,
  siteImages,
  siteInfo,
  siteMeta,
} from '@/config/site-data'

declare global {
  interface Window {
    LIRenderAll?: () => void
  }
}

export const Route = createFileRoute('/')({
  loader: async () => {
    const [
      posts,
      projects,
      certificates,
      health,
      avatarHash,
      profile,
      pinterestData,
      gamesData,
    ] = await Promise.all([
      getBlogIndex(),
      getProjectIndex(),
      getCertificateIndex(),
      getHealthData(),
      hashEmail(gravatarConfig.email),
      getGravatarProfile({
        data: gravatarConfig.slug,
      }),
      getPinterestCreatedPins(),
      getGamesData(),
    ])

    return {
      posts,
      projects,
      certificates,
      health,
      avatarHash,
      profile,
      pinterestData,
      gamesData,
    }
  },
  head: () => {
    const title = siteMeta.defaultTitle
    const description = siteMeta.defaultDescription
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`
    const canonicalUrl = siteMeta.baseUrl

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: siteMeta.baseUrl },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:alt', content: title },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: title },
      ],
      links: [
        { rel: 'canonical', href: canonicalUrl },
        { rel: 'image_src', href: `${siteMeta.baseUrl}${siteImages.banner}` },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: siteInfo.name,
            image: imageUrl,
            url: siteMeta.baseUrl,
            address: {
              '@type': 'PostalAddress',
              addressLocality: 'Prayagraj',
              addressRegion: 'Uttar Pradesh',
              addressCountry: 'IN',
            },
            priceRange: '$$',
            description,
          }),
        },
      ],
    }
  },
  component: App,
})

function formatMetricValue(value: number, digits = 0) {
  return Number.isFinite(value) ? value.toFixed(digits) : '0'
}

function sanitizeSamples<T extends { value: number | string }>(
  samples?: Array<T>,
): Array<T & { value: number | string }> {
  return samples || []
}

function LazyHeroVideo({ src }: { src: string }) {
  const [shouldRender, setShouldRender] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    const el = containerRef.current
    if (!el) return

    const mount = () => setShouldRender(true)
    const schedule = () => {
      const ric = (
        window as Window & {
          requestIdleCallback?: (
            cb: () => void,
            opts?: { timeout: number },
          ) => number
        }
      ).requestIdleCallback
      if (typeof ric === 'function') {
        ric(mount, { timeout: 2500 })
        return
      }
      window.setTimeout(mount, 800)
    }

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            io.disconnect()
            schedule()
          }
        },
        { rootMargin: '200px' },
      )
      io.observe(el)
      return () => io.disconnect()
    }

    schedule()
  }, [])

  return (
    <div
      ref={containerRef}
      className="hero-blend-media hero-home-video media-hover-image media-hover-fade absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {shouldRender ? (
        <video
          src={src}
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          aria-hidden="true"
        />
      ) : null}
    </div>
  )
}

function App() {
  const {
    posts,
    projects,
    certificates,
    health,
    avatarHash,
    profile,
    pinterestData,
    gamesData,
  } = Route.useLoaderData()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    let attempts = 0
    const maxAttempts = 10
    const intervalId = window.setInterval(() => {
      attempts += 1

      if (window.LIRenderAll) {
        window.LIRenderAll()
        window.clearInterval(intervalId)
        return
      }

      if (attempts >= maxAttempts) {
        window.clearInterval(intervalId)
      }
    }, 500)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const APPLE_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.14,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 36, filter: 'blur(6px)' },
    show: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: {
        duration: 1.1,
        ease: APPLE_EASE,
      },
    },
  }

  const featuredProjects = projects.slice(0, 5)
  const featuredPosts = posts.slice(0, 5)
  const featuredCertificates = certificates.slice(0, 7)
  const featuredPins = pinterestData.pins.slice(0, 4)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-20 md:gap-28"
    >
      <motion.div
        variants={item}
        className="flex items-center gap-4 w-full -mb-12 px-4 sm:px-8"
      >
        <a
          href={gravatar.profileUrl}
          target="_blank"
          rel="noopener noreferrer me"
          className="shrink-0"
        >
          <GravatarAvatar
            hash={avatarHash}
            size={44}
            alt={`${siteInfo.name} profile photo`}
            className="h-22 w-22 ring-1 ring-border/20"
            rel="me"
          />
        </a>
        <div className="flex min-w-0 flex-col">
          <span className="text-3xl md:text-5xl font-semibold tracking-tight text-foreground font-serif capitalize">
            {siteInfo.name}
          </span>
          <span className="text-sm text-muted-foreground/70">
            {siteInfo.currentRole}
          </span>
        </div>
        <div className="ml-auto hidden lg:block">
          <KeyboardHint />
        </div>
      </motion.div>

      <motion.section
        variants={item}
        className="flex flex-col items-center text-center px-2"
      >
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: APPLE_EASE, delay: 0.2 }}
          className="mb-10 flex items-center gap-3"
        >
          <motion.svg
            viewBox="0 0 60 1"
            preserveAspectRatio="none"
            className="h-px w-10 overflow-visible text-primary/60"
            aria-hidden="true"
          >
            <motion.line
              x1="0"
              y1="0.5"
              x2="60"
              y2="0.5"
              stroke="currentColor"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: APPLE_EASE, delay: 0.3 }}
            />
          </motion.svg>
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary/80">
            android · ai · cloud · web · design · devops
          </p>
          <motion.svg
            viewBox="0 0 60 1"
            preserveAspectRatio="none"
            className="h-px w-10 overflow-visible text-primary/60"
            aria-hidden="true"
          >
            <motion.line
              x1="0"
              y1="0.5"
              x2="60"
              y2="0.5"
              stroke="currentColor"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: APPLE_EASE, delay: 0.3 }}
            />
          </motion.svg>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 32, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.6, ease: APPLE_EASE, delay: 0.1 }}
          className="max-w-5xl font-sans text-5xl leading-[1.02] tracking-tight text-foreground sm:text-7xl lg:text-8xl"
        >
          Designing and shipping software that feels{' '}
          <span className="relative inline-block whitespace-nowrap">
            <span className="text-primary italic pr-2">a step ahead</span>
            <motion.svg
              viewBox="0 0 200 8"
              preserveAspectRatio="none"
              className="absolute -bottom-1 left-0 h-2 w-full overflow-visible text-primary/60"
              aria-hidden="true"
            >
              <motion.path
                d="M2,5 Q50,1 100,4 T198,3"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.8, ease: APPLE_EASE, delay: 1.2 }}
              />
            </motion.svg>
          </span>
          .
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 1.4, ease: APPLE_EASE, delay: 0.3 }}
          className="mt-8 max-w-2xl text-lg leading-relaxed text-foreground/60 sm:text-xl font-medium"
        >
          {siteInfo.currentRole} based in {siteInfo.location}, building web and
          android products with AI, cloud systems, and a latest-is-greatest
          mindset. Fewer widgets, more atmosphere, and work that reads clearly
          on every screen.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: APPLE_EASE, delay: 0.5 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            to="/projects"
            className="group relative inline-flex items-center gap-2 rounded-full bg-foreground px-8 py-3.5 text-sm font-semibold text-background overflow-hidden transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <span className="relative z-10">Selected Work</span>
            <div className="absolute inset-0 bg-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-border/20 bg-background/50 backdrop-blur-md px-8 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 active:scale-95"
          >
            Latest Writing
          </Link>
          <a
            data-cal-namespace="connect"
            data-cal-link={siteInfo.calLink}
            data-cal-config='{"layout":"week_view","useSlotsViewOnSmallScreen":"true"}'
            href={siteInfo.calLink}
            className="inline-flex items-center gap-2 rounded-full border border-border/20 bg-background/50 backdrop-blur-md px-8 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/40 hover:bg-primary/5 active:scale-95"
          >
            <CalendarIcon size={14} className="text-primary" />
            Book a Call
          </a>
        </motion.div>
      </motion.section>

      <motion.section
        variants={item}
        className="hero-seamless-stage relative -mt-8 min-h-80 overflow-hidden lg:min-h-105"
      >
        <div className="pointer-events-none absolute inset-x-[12%] top-[10%] h-28 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-[24%] bottom-[18%] h-36 rounded-full bg-primary/8 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[14%] h-48 w-48 rounded-full bg-primary/6 blur-[120px]" />

        <div className="absolute inset-x-0 top-4 z-10 flex items-center justify-between gap-4 px-6 text-[10px] uppercase tracking-[0.2em] text-foreground/35">
          <span>{siteInfo.location}</span>
          <span>
            {siteMeta.alternateUrls.gravatarDomain.replace('https://', '')}
          </span>
        </div>

        <div className="absolute inset-0">
          <LazyHeroVideo src="/horizon.mp4" />
          <div className="hero-grid-overlay absolute inset-y-[8%] right-[3%] w-[82%]" />
          <div className="hero-seamless-edge absolute inset-0" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex items-center gap-4 sm:max-w-[72%]">
            <a
              href={gravatar.profileUrl}
              target="_blank"
              rel="noopener noreferrer me"
              className="shrink-0"
              aria-label="Gravatar profile"
            >
              <img
                src="/icon.svg"
                width={56}
                height={56}
                className="h-14 w-14"
                alt="Bhaumic Singh logo"
              />
            </a>
            <div className="min-w-0 text-foreground">
              <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">
                currently building
              </p>
              <a
                href={siteInfo.currentCompanyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block text-lg font-semibold leading-tight transition-colors hover:text-primary sm:text-xl"
              >
                {siteInfo.currentRole}
                <span className="block text-sm font-normal text-foreground/70 sm:inline sm:pl-2">
                  at {siteInfo.currentCompany}
                </span>
              </a>
            </div>
          </div>

          <div className="relative isolate w-full">
            <p className="relative z-10 max-w-xl text-sm leading-7 text-foreground/70">
              Current favorite game -{' '}
              <em className="italic font-medium text-foreground/70">
                {siteInfo.currentGame}
              </em>
              .
            </p>
            <img
              src="/aloy.png"
              alt="Aloy from Horizon Zero Dawn"
              width={128}
              height={192}
              loading="lazy"
              decoding="async"
              className="absolute right-0 bottom-0 z-0 h-auto w-12 sm:w-16 lg:w-24 xl:w-32"
            />
          </div>
        </div>
      </motion.section>

      <motion.div
        variants={item}
        className="flex flex-col gap-24 md:gap-32 px-4 sm:px-8"
      >
        <Section title="current">
          <div className="relative min-h-130 sm:min-h-145 lg:min-h-160">
            <motion.div
              initial={{ opacity: 0, y: 40, rotate: -8 }}
              whileInView={{ opacity: 1, y: 0, rotate: -6 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{
                delay: 0.1,
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={{
                y: -8,
                rotate: -2,
                scale: 1.03,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              className="hidden sm:block absolute left-[2%] top-[2%] sm:left-[4%] sm:top-[4%] lg:left-[6%] lg:top-[6%] z-10 w-45 sm:w-50 lg:w-55"
            >
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-background/40 shadow-2xl backdrop-blur-3xl sm:backdrop-blur-3xl">
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/80 mb-2 drop-shadow-sm">
                    Education
                  </p>
                  <p className="text-xs leading-relaxed text-foreground/80 font-medium">
                    {siteInfo.educationLine}
                  </p>
                </div>
                <div className="aspect-square overflow-hidden rounded-t-3xl">
                  <img
                    src="/frieren/frieren-teach.svg"
                    alt="Education"
                    className="h-full w-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 6 }}
              whileInView={{ opacity: 1, y: 0, rotate: 4 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.25, duration: 1, ease: APPLE_EASE }}
              whileHover={{
                rotate: 1,
                scale: 1.02,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              className="hidden sm:block absolute right-[2%] top-[0%] sm:right-[6%] sm:top-[2%] lg:top-[3%] z-10 w-45 sm:w-52.5 lg:w-60"
            >
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-background/40 shadow-2xl backdrop-blur-3xl">
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/80 mb-2 drop-shadow-sm">
                    Interests
                  </p>
                  <p className="text-xs leading-relaxed text-foreground/80 font-medium">
                    {siteInfo.interests}
                  </p>
                </div>
                <div className="aspect-4/3 overflow-hidden rounded-t-3xl">
                  <img
                    src="/frieren/frienbook.svg"
                    alt="Interests"
                    className="h-full w-full object-cover transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40, rotate: 4 }}
              whileInView={{ opacity: 1, y: 0, rotate: 2 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.4, duration: 1, ease: APPLE_EASE }}
              whileHover={{
                rotate: 0,
                scale: 1.02,
                transition: { type: 'spring', stiffness: 300, damping: 20 },
              }}
              className="hidden md:block absolute left-[4%] bottom-[2%] sm:left-[8%] sm:bottom-[4%] lg:left-[10%] lg:bottom-[3%] z-10 w-40 sm:w-45 lg:w-50"
            >
              <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-background/40 shadow-2xl backdrop-blur-3xl">
                <div className="aspect-3/2 overflow-hidden rounded-t-3xl flex items-center justify-center bg-primary/5">
                  <img
                    src="/frieren/party.svg"
                    alt="Capabilities"
                    className="h-3/4 w-3/4 object-contain transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/80 mb-2 drop-shadow-sm">
                    Capabilities
                  </p>
                  <p className="text-xs leading-relaxed text-foreground/80 font-medium">
                    i can build{' '}
                    <span className="font-semibold text-primary">
                      literally anything.
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -4 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ delay: 0.5, duration: 1, ease: APPLE_EASE }}
              whileHover={{
                rotate: -2,
                scale: 1.05,
                transition: { type: 'spring', stiffness: 400, damping: 20 },
              }}
              className="absolute right-[6%] bottom-[8%] sm:right-[10%] sm:bottom-[10%] lg:right-[12%] lg:bottom-[8%] z-10 w-30 sm:w-35"
            >
              <div className="group overflow-hidden rounded-[20px] border border-white/10 bg-background/40 shadow-2xl backdrop-blur-3xl">
                <div className="aspect-square overflow-hidden rounded-[20px] flex items-center justify-center bg-primary/10">
                  <img
                    src="/frieren/frieren.svg"
                    alt="Frieren"
                    className="h-4/5 w-4/5 object-contain transition-transform duration-[1.5s] ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:rotate-6"
                    loading="lazy"
                  />
                </div>
              </div>
            </motion.div>

            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center px-4 pointer-events-none">
              <div
                aria-hidden="true"
                className="absolute inset-x-[6%] top-[16%] bottom-[12%] rounded-full bg-background/32 backdrop-blur-xl sm:inset-x-[10%] sm:top-[12%] sm:bottom-[10%]"
                style={{
                  maskImage:
                    'radial-gradient(circle at center, black 2%, black 12%, transparent 100%)',
                  WebkitMaskImage:
                    'radial-gradient(circle at center, black 2%, black 12%, transparent 100%)',
                }}
              />
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative z-10 flex max-w-216 flex-col items-center rounded-[2.5rem] px-5 py-6 text-center pointer-events-auto sm:px-8 sm:py-8"
              >
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/45 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-primary shadow-[0_10px_35px_rgb(0_0_0_/0.16)] backdrop-blur-md">
                  <CurrentIcon size={14} className="h-3.5 w-3.5 opacity-70" />
                  currently
                </span>

                <h2
                  className="max-w-3xl text-balance text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                  style={{ textShadow: '0 6px 24px rgb(0 0 0 / 0.38)' }}
                >
                  Building tools at{' '}
                  <motion.a
                    href={siteInfo.currentCompanyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/current relative font-serif inline-flex flex-wrap items-center justify-center gap-2 text-primary transition-colors duration-500 hover:text-primary/80"
                    whileHover={{ scale: 1.02 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                    style={{ textShadow: '0 8px 28px rgb(0 0 0 / 0.32)' }}
                  >
                    <img
                      src="/khub.svg"
                      alt="KarkhanaHub Logo"
                      width={44}
                      height={44}
                      loading="lazy"
                      data-backlight="off"
                      className="mr-1 inline-block h-10 w-10 rounded-lg object-cover ring-1 ring-black/10 shadow-lg transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/current:scale-[1.4] group-hover/current:rotate-360 group-hover/current:drop-shadow-[0_0_8px_var(--primary)] sm:h-12 sm:w-12"
                    />
                    <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
                      {siteInfo.currentCompany}
                    </span>
                  </motion.a>
                </h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="mt-5 max-w-2xl text-sm leading-7 text-foreground/80 sm:mt-6 sm:text-lg sm:leading-8"
                  style={{ textShadow: '0 3px 18px rgb(0 0 0 / 0.22)' }}
                >
                  {siteInfo.currentSummary}
                </motion.p>
              </motion.div>
            </div>
          </div>
        </Section>

        <Section title="previous">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-col items-center text-center mb-12"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border/20 bg-foreground/3 px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60 backdrop-blur-sm mb-6">
              <PreviousIcon size={14} className="h-3.5 w-3.5 opacity-70" />
              experience
            </span>
            <h2 className="max-w-2xl font-serif text-4xl leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Where I've been.
            </h2>
            <p className="mt-4 max-w-lg text-base leading-8 text-foreground/40">
              A track record of shipping products across roles and companies.
            </p>
          </motion.div>
          <PreviousRoadmap />
        </Section>
      </motion.div>

      <motion.div variants={item} className="my-22 px-4 sm:px-8">
        <Section title="projects">
          <div className="grid gap-5 md:columns-2 md:grid-cols-2">
            {featuredProjects.map((project: ProjectMeta, index: number) => {
              const projectVisual =
                project.image || `/og/projects/${project.slug}`
              const isTall = index % 3 === 0

              return (
                <motion.div
                  key={project.slug}
                  initial={{ opacity: 0, scale: 0.92, y: 60 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.9,
                    ease: [0.25, 0.1, 0.25, 1],
                  }}
                  className={isTall ? 'md:row-span-2' : ''}
                >
                  <Link
                    to="/projects/$slug"
                    params={{ slug: project.slug }}
                    className="group block h-full"
                  >
                    <article
                      className={`project-card-apple relative overflow-hidden rounded-2xl h-full ${
                        isTall
                          ? 'min-h-105 md:min-h-160'
                          : 'min-h-85 md:min-h-75'
                      }`}
                    >
                      <div className="media-hover-parent absolute inset-0">
                        <img
                          src={projectVisual}
                          alt={project.title}
                          className="media-hover-image absolute inset-0 h-full w-full object-cover"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
                        <div className="absolute inset-0 bg-linear-to-t from-background/80 via-transparent to-transparent" />
                      </div>

                      <div className="absolute inset-x-0 bottom-0 z-10 border-t border-white/6 bg-background/60 p-5 backdrop-blur-xl sm:p-6">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex items-center justify-between gap-4">
                            <p className="text-[10px] uppercase tracking-[0.25em] text-primary/50">
                              {project.categories.length > 0
                                ? project.categories[0]
                                : 'project'}
                            </p>
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                              {formatDate(project.date)}
                            </p>
                          </div>
                          <h3 className="font-serif text-xl leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl lg:text-3xl">
                            {project.title}
                          </h3>
                          <p className="line-clamp-2 text-sm leading-7 text-foreground/70">
                            {project.summary}
                          </p>
                          {project.stack.length > 0 ? (
                            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                              {project.stack.slice(0, 4).join(' · ')}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              )
            })}
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground/70">
              More in the archive.
            </p>
            <Link
              to="/projects"
              className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              View all projects
              <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </Section>
      </motion.div>

      <motion.div variants={item} className="px-4 sm:px-8">
        <Section title="blogs">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredPosts.map((post: BlogMeta, index: number) => (
              <motion.div
                key={post.slug}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.08,
                  ease: [0.25, 0.1, 0.25, 1],
                }}
                className={index === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}
              >
                <Link
                  to="/blog/$slug"
                  params={{ slug: post.slug }}
                  className="group block h-full"
                >
                  <motion.article
                    whileHover={{ y: -3 }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 25,
                    }}
                    className={`project-card-apple flex h-full flex-col justify-between gap-4 rounded-2xl border border-border/10 bg-card/40 p-5 sm:p-6 ${
                      index === 0 ? 'sm:flex-row sm:items-center sm:gap-8' : ''
                    }`}
                  >
                    <div className="flex flex-1 flex-col gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] uppercase tracking-[0.2em] text-primary/50">
                          {post.categories.length > 0
                            ? post.categories[0]
                            : 'essay'}
                        </span>
                        <span className="h-px flex-1 bg-border/10" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                          {formatDate(post.date)}
                        </span>
                      </div>
                      <h3
                        className={`font-serif leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary ${
                          index === 0 ? 'text-xl sm:text-2xl' : 'text-lg'
                        }`}
                      >
                        {post.title}
                      </h3>
                      <p
                        className={`text-sm leading-7 text-foreground/45 ${
                          index === 0 ? '' : 'line-clamp-2'
                        }`}
                      >
                        {post.summary}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-border/8 pt-3">
                      {post.tags.length > 0 ? (
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30">
                          {post.tags.slice(0, 3).join(' · ')}
                        </p>
                      ) : (
                        <span />
                      )}
                      <span className="text-xs text-primary/50 transition-transform duration-300 group-hover:translate-x-1">
                        &rarr;
                      </span>
                    </div>
                  </motion.article>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground/45">
              Build logs and essays.
            </p>
            <Link
              to="/blog"
              className="group/link inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
            >
              All writing
              <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </Section>
      </motion.div>

      <motion.div variants={item} className="px-4 sm:px-8">
        <Section title="healthstat">
          <div className="grid min-w-0 gap-8">
            <div className="grid min-w-0 gap-0 overflow-hidden rounded-2xl border border-border/10 bg-card/30 p-4 sm:p-6">
              <div className="flex flex-col divide-y divide-border/15">
                <MetricRow
                  label="steps"
                  samples={sanitizeSamples(health.steps)}
                  unit="steps"
                  type="sum"
                  chartType="bar"
                  color="#f97316"
                />
                <MetricRow
                  label="energy"
                  samples={sanitizeSamples(health.activeEnergy)}
                  unit="kcal"
                  type="sum"
                  chartType="area"
                  color="#ef4444"
                  format={(v: number) => formatMetricValue(v, 0)}
                />
                <MetricRow
                  label="heart rate"
                  samples={sanitizeSamples<HealthSample>(health.heartRate).map(
                    (sample) => {
                      const value = Number(sample.value)
                      const start = new Date(sample.startDate).getTime()
                      const end = new Date(sample.endDate).getTime()
                      const minutes = (end - start) / 1000
                      const bpm =
                        value > 300 && minutes > 0 ? value / minutes : value

                      return {
                        ...sample,
                        value: bpm,
                      } as HealthSample & { value: number }
                    },
                  )}
                  unit="bpm"
                  type="avg"
                  chartType="scatter"
                  color="#f43f5e"
                  format={(v: number) => formatMetricValue(v, 0)}
                />
                <MetricRow
                  label="distance"
                  samples={sanitizeSamples(health.distance)}
                  unit="km"
                  type="sum"
                  chartType="bar"
                  color="#3b82f6"
                  format={(v: number) => formatMetricValue(v, 2)}
                />
                <MetricRow
                  label="sleep"
                  samples={sanitizeSamples(health.sleep)}
                  unit="hrs"
                  type="sum"
                  chartType="area"
                  color="#818cf8"
                  format={(v: number) => formatMetricValue(v, 1)}
                />
                <MetricRow
                  label="spO2"
                  samples={sanitizeSamples(health.spO2)}
                  unit="%"
                  type="avg"
                  chartType="line"
                  color="#22d3ee"
                  format={(v: number) => formatMetricValue(v, 1)}
                />
              </div>
            </div>

            <Link to="/readme" className="block min-w-0 overflow-hidden">
              <GitHubHeatmap username={siteInfo.githubUsername} />
            </Link>

            {health.updatedAt && isMounted ? (
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                last updated {new Date(health.updatedAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        </Section>
      </motion.div>

      <motion.div
        variants={item}
        className="grid gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)] px-4 sm:px-8"
      >
        <Section title="pinterest">
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              className="pointer-events-none absolute left-1/2 top-1/2 z-20 w-45 -translate-x-1/2 -translate-y-1/2 sm:w-55"
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="relative"
              >
                <div className="absolute inset-x-7 top-1/2 h-10 -translate-y-1/2 rounded-full bg-[#e60023]/18 blur-2xl" />
                <img
                  src="/pin.svg"
                  alt="pinterest"
                  aria-hidden="true"
                  className="h-auto w-full"
                />
              </motion.div>
            </motion.div>

            {featuredPins.length > 0 ? (
              <div className="flex flex-col gap-6">
                {featuredPins[0] ? (
                  <a
                    href={featuredPins[0].url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="project-card-apple relative overflow-hidden rounded-3xl border border-border/10">
                      <div className="media-hover-parent relative aspect-video">
                        <img
                          src={featuredPins[0].imageUrl}
                          alt=""
                          loading="lazy"
                          width={featuredPins[0].imageWidth}
                          height={featuredPins[0].imageHeight}
                          className="media-hover-image absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                        <p className="line-clamp-2 font-serif text-sm leading-tight tracking-tight text-white sm:text-base">
                          {featuredPins[0].title}
                        </p>
                      </div>
                    </div>
                  </a>
                ) : null}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {featuredPins.slice(1).map((pin: PinterestCreatedPin) => (
                    <a
                      key={pin.id}
                      href={pin.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <div className="project-card-apple overflow-hidden rounded-xl border border-border/10 bg-card/40">
                        <div className="media-hover-parent relative aspect-square">
                          <img
                            src={pin.imageUrl}
                            alt=""
                            loading="lazy"
                            width={pin.imageWidth}
                            height={pin.imageHeight}
                            className="media-hover-image absolute inset-0 h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-linear-to-t from-card/50 via-transparent to-transparent" />
                        </div>
                        <div className="p-2.5">
                          <p className="line-clamp-1 text-[11px] font-medium text-foreground/70 transition-colors duration-300 group-hover:text-primary">
                            {pin.title}
                          </p>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>

                <Link
                  to="/pinterest"
                  className="inline-flex items-center gap-2 self-end text-xs text-muted-foreground/70 transition-colors duration-300 hover:text-primary"
                >
                  full gallery
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    &rarr;
                  </span>
                </Link>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Couldn&apos;t load pins right now. You can still open the{' '}
                <a
                  href={pinterest.createdUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline underline-offset-4"
                >
                  Pinterest created feed
                </a>
                .
              </p>
            )}
          </div>
        </Section>

        <Section title="certificates">
          <div className="grid gap-3">
            {featuredCertificates.map(
              (cert: CertificateMeta, index: number) => (
                <Link
                  key={cert.id}
                  to="/certificates/$slug"
                  params={{ slug: cert.slug }}
                  className="group block"
                >
                  <div
                    className={`project-card-apple flex items-center gap-4 rounded-xl border border-border/10 bg-card/40 p-4 transition-all duration-300 ${
                      index === 0
                        ? 'flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-5'
                        : ''
                    }`}
                  >
                    {index === 0 && cert.image_url ? (
                      <div className="shrink-0 overflow-hidden rounded-lg bg-foreground/2 sm:w-28">
                        <img
                          src={cert.image_url}
                          alt={cert.title}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          className="h-20 w-full object-contain sm:h-16"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col gap-1.5">
                      <div className="flex items-center gap-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-primary/50">
                          {cert.issuer}
                        </p>
                        <span className="h-px flex-1 bg-border/10" />
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                          {cert.issued}
                        </p>
                      </div>
                      <h3 className="font-serif text-base leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                        {cert.title}
                      </h3>
                      {cert.skills.length > 0 ? (
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30">
                          {cert.skills.slice(0, 3).join(' \u00b7 ')}
                        </p>
                      ) : null}
                    </div>
                    <span className="shrink-0 text-xs text-primary/40 transition-transform duration-300 group-hover:translate-x-1">
                      &rarr;
                    </span>
                  </div>
                </Link>
              ),
            )}
          </div>
          <Link
            to="/certificates"
            className="inline-flex items-center gap-2 self-end text-xs text-muted-foreground/70 transition-colors duration-300 hover:text-primary"
          >
            all credentials
            <span>&rarr;</span>
          </Link>
        </Section>
      </motion.div>

      <motion.div variants={item}>
        <GamesCinematic gamesData={gamesData} />
      </motion.div>

      <motion.div variants={item}>
        <Section title="contact">
          <div className="relative overflow-hidden pb-8">
            <div className="pointer-events-none absolute inset-x-[14%] top-[8%] h-24 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute right-[8%] top-[18%] h-72 w-full sm:w-72 rounded-full bg-primary/8 blur-[120px]" />

            <div className="media-hover-parent absolute inset-y-0 left-[34%] right-[-6%]">
              <img
                src={siteImages.profilePhoto}
                alt={siteInfo.name}
                className="hero-blend-media absolute inset-0 h-full w-full object-contain object-bottom sm:object-cover sm:object-center"
              />
              <div className="absolute inset-0 bg-linear-to-l from-background/10 via-background/58 to-background" />
              <div className="absolute inset-y-0 right-[-2%] w-[24%] bg-linear-to-l from-background via-background to-transparent blur-3xl" />
              <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90" />
            </div>

            <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-end px-4 sm:px-8">
              <div className="grid gap-8 py-2 lg:pr-12">
                <div className="flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.2em] text-foreground/30">
                  <span>{siteInfo.location}</span>
                  <span>
                    {siteMeta.alternateUrls.gravatarDomain.replace(
                      'https://',
                      '',
                    )}
                  </span>
                </div>
                <div className="grid gap-5">
                  <h2 className="max-w-4xl font-serif text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                    Say hello when the work needs clarity, pace, and someone who
                    can ship the whole thing.
                  </h2>
                  <p className="max-w-3xl text-base leading-8 text-foreground/70 sm:text-lg">
                    Read my{' '}
                    {contactLinks.map((link, index) => (
                      <span key={link.label}>
                        <Link
                          to={link.url}
                          className="text-primary transition-colors hover:text-primary/80"
                          rel="me"
                        >
                          {link.label}
                        </Link>
                        {index < contactLinks.length - 1 ? ', ' : ' '}
                      </span>
                    ))}
                    or book a call on{' '}
                    <a
                      href={siteInfo.calLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary transition-colors hover:text-primary/80"
                    >
                      cal.com
                    </a>
                    . Open a link, get context quickly, and start building.
                  </p>
                </div>

                <div className="h-px w-full bg-border/10" />

                <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center pl-6">
                  <a
                    href={gravatar.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer me"
                    className="shrink-0"
                  >
                    <GravatarAvatar
                      hash={avatarHash}
                      size={64}
                      alt={`${siteInfo.name} contact avatar`}
                      className="h-16 w-16 ring-1 ring-border/15"
                    />
                  </a>
                  <div className="grid gap-2">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                      public profile
                    </p>
                    <p className="max-w-2xl text-sm leading-7 text-foreground/70">
                      {profile?.description || siteInfo.tagline}
                    </p>
                    {profile?.verified_accounts?.length ? (
                      <GravatarSocialLinks
                        accounts={profile.verified_accounts}
                        iconSize={20}
                        className="gap-4"
                      />
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="grid gap-0 pr-6">
                <Link
                  to="/readme"
                  className="flex items-center justify-between gap-4 border-b border-border/10 py-4 text-sm leading-7 text-foreground/70 transition-colors duration-300 hover:text-primary"
                >
                  <span className="font-medium">README</span>
                  <span className="text-muted-foreground text-xs">
                    reference
                  </span>
                </Link>
                <Link
                  to="/resume"
                  className="flex items-center justify-between gap-4 border-b border-border/10 py-4 text-sm leading-7 text-foreground/70 transition-colors duration-300 hover:text-primary"
                >
                  <span className="font-medium">Resume</span>
                  <span className="text-muted-foreground text-xs">
                    experience
                  </span>
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center justify-between gap-4 border-b border-border/10 py-4 text-sm leading-7 text-foreground/70 transition-colors duration-300 hover:text-primary"
                >
                  <span className="font-medium">Writing</span>
                  <span className="text-muted-foreground text-xs">notes</span>
                </Link>
                <a
                  href={gravatar.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="flex items-center justify-between gap-4 py-4 text-sm leading-7 text-foreground/70 transition-colors duration-300 hover:text-primary"
                >
                  <span className="font-medium">Gravatar</span>
                  <span className="text-muted-foreground text-xs">
                    identity
                  </span>
                </a>
              </div>
            </div>
          </div>
        </Section>
      </motion.div>

      <motion.p
        variants={item}
        className="flex flex-col items-center justify-between gap-1 text-center font-mono text-[10px] tracking-[0.2em] text-muted-foreground/30 sm:flex-row sm:text-left px-8"
      >
        <span>Yes, this portfolio can run DOOM.</span>
        <span>Konami Code: ↑ ↑ ↓ ↓ ← → ← → b a</span>
      </motion.p>
    </motion.div>
  )
}
