import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'

import type { BlogMeta, ProjectMeta } from '@/lib/content'
import { getBlogIndex, getProjectIndex } from '@/lib/content'
import type { CertificateMeta } from '@/lib/certificates'
import { getCertificateIndex } from '@/lib/certificates'
import { formatDate } from '@/lib/format'
import { hashEmail } from '@/lib/gravatar'
import { getGravatarProfile } from '@/lib/gravatar-profile'
import type { HealthSample } from '@/lib/health'
import { getHealthData } from '@/lib/health'
import { getGamesData } from '@/lib/games'
import type { PinterestCreatedPin } from '@/lib/pinterest'
import { getPinterestCreatedPins } from '@/lib/pinterest'

import { KeyboardHint } from '@/components/CommandMenu'
import { Section, MetricRow } from '@/components/functions'
import GitHubHeatmap from '@/components/GitHubHeatmap'
import GravatarAvatar from '@/components/gravatar/GravatarAvatar'
import GravatarSocialLinks from '@/components/gravatar/GravatarSocialLinks'
import { PreviousRoadmap } from '@/components/PreviousRoadmap'
import { GamesCinematic } from '@/components/GamesCinematic'
import CalendarIcon from '@/components/ui/calendar-icon'
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

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 32 },
    show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] } },
  }

  const featuredProjects = projects.slice(0, 4)
  const featuredPosts = posts.slice(0, 5)
  const featuredCertificates = certificates.slice(0, 6)
  const featuredPins = pinterestData.pins.slice(0, 6)

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-20 md:gap-28"
    >
      <motion.div
        variants={item}
        className="flex items-center gap-4 w-full -mb-12"
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
            className="h-11 w-11 ring-1 ring-border/20"
            rel="me"
          />
        </a>
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-semibold tracking-tight text-foreground">
            {siteInfo.name}
          </span>
          <span className="text-xs text-muted-foreground/50">
            {siteInfo.currentRole}
          </span>
        </div>
        <div className="ml-auto hidden lg:block">
          <KeyboardHint />
        </div>
      </motion.div>
      {/* Hero — centered Apple-style */}
      <motion.section variants={item} className="flex flex-col items-center text-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-primary/55 mb-8">
          android · ai · cloud · web · design · devops
        </p>
        <h1 className="max-w-5xl font-serif text-5xl leading-[1.06] tracking-tight text-foreground sm:text-6xl lg:text-7xl xl:text-8xl">
          Designing and shipping software that feels a step ahead.
        </h1>
        <p className="mt-7 max-w-2xl text-base leading-8 text-foreground/50 sm:text-lg">
          {siteInfo.currentRole} based in {siteInfo.location}, building web
          and android products with AI, cloud systems, and a
          latest-is-greatest mindset. Fewer widgets, more atmosphere, and work
          that reads clearly on every screen.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/projects"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-all duration-300 hover:bg-primary"
          >
            Selected Work
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full border border-border/30 px-7 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary"
          >
            Latest Writing
          </Link>
          <a
            data-cal-namespace="connect"
            data-cal-link={siteInfo.calLink}
            data-cal-config='{"layout":"week_view","useSlotsViewOnSmallScreen":"true"}'
            href={siteInfo.calLink}
            className="inline-flex items-center gap-2 rounded-full border border-border/30 px-7 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary"
          >
            <CalendarIcon size={14} className="text-primary" />
            Book a Call
          </a>
        </div>
      </motion.section>

      {/* Visual showcase — video + role card */}
      <motion.section variants={item} className="relative -mt-8 min-h-80 overflow-hidden rounded-3xl lg:min-h-105">
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
          <video
            src="/horizon.mp4"
            className="hero-blend-media media-hover-image media-hover-fade absolute inset-0 h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="hero-grid-overlay absolute inset-y-[8%] right-[3%] w-[82%]" />
        </div>

        <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-5 p-6 sm:p-8">
          <div className="flex items-center gap-4 sm:max-w-[72%]">
            <a
              href={gravatar.profileUrl}
              target="_blank"
              rel="noopener noreferrer me"
              className="shrink-0"
            >
              <img
                src="/icon.svg"
                width={56}
                height={56}
                className="h-14 w-14"
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
                <span className="block text-sm font-normal text-foreground/50 sm:inline sm:pl-2">
                  at {siteInfo.currentCompany}
                </span>
              </a>
            </div>
          </div>

          <div className="relative isolate w-full">
            <p className="relative z-10 max-w-xl text-sm leading-7 text-foreground/50">
              Current favorite game -{' '}
              <em className="italic font-medium text-foreground/70">{siteInfo.currentGame}</em>
              .
            </p>
            <img
              src="/aloy.png"
              alt="Aloy from Horizon Zero Dawn"
              className="absolute right-0 bottom-0 z-0 h-auto w-12 sm:w-16 lg:w-24 xl:w-32"
            />
          </div>
        </div>
      </motion.section>

      <motion.div
        variants={item}
        className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16"
      >
        <Section title="current">
          <motion.p whileHover={{ x: 3 }} className="group/current">
            {siteInfo.currentRole} at{' '}
            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              href={siteInfo.currentCompanyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 rounded-sm font-black italic underline decoration-primary underline-offset-1 bg-foreground text-background"
            >
              <img
                src="/khub.svg"
                alt="KarkhanaHub Logo"
                width={24}
                height={24}
                loading="lazy"
                data-backlight="off"
                className="inline-block w-6 h-6 mr-2 rounded-sm object-cover transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover/current:scale-[1.4] group-hover/current:rotate-360 group-hover/current:drop-shadow-[0_0_8px_var(--primary)]"
              />
              {siteInfo.currentCompany}
            </motion.a>
            . {siteInfo.currentSummary}
          </motion.p>
          <motion.p whileHover={{ x: 3 }}>{siteInfo.educationLine}</motion.p>
          <motion.p whileHover={{ x: 3 }}>{siteInfo.interests}</motion.p>
          <motion.p whileHover={{ x: 3 }} className="space-x-4">
            i can build{' '}
            <span className="font-semibold text-primary">
              literally anything.
            </span>
            <img
              src="/frieren/party.svg"
              className="h-7 sm:h-9 inline-block align-bottom ml-1"
            />
          </motion.p>
        </Section>

        <Section title="previous">
          <PreviousRoadmap />
        </Section>
      </motion.div>

      <motion.div variants={item}>
        <Section title="projects">
          <div className="grid gap-6">
            {featuredProjects.map((project: ProjectMeta, index: number) => (
              <Link
                key={project.slug}
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="group block"
              >
                <article className="relative min-h-65 overflow-hidden rounded-2xl py-2 md:min-h-80">
                  <div
                    className={`media-hover-parent absolute inset-y-0 ${index % 2 === 0 ? 'left-[34%] right-0' : 'left-0 right-[34%]'}`}
                  >
                    {project.image ? (
                      <img
                        src={project.image}
                        alt={project.title}
                        className="project-ambient-media absolute inset-0 h-full w-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-primary/12 via-muted/8 to-transparent" />
                    )}
                    <div
                      className={`absolute inset-0 ${
                        index % 2 === 0
                          ? 'project-ambient-overlay bg-linear-to-r from-background via-background/55 to-transparent'
                          : 'project-ambient-overlay bg-linear-to-l from-background via-background/55 to-transparent'
                      }`}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-transparent to-transparent opacity-90" />
                  </div>

                  <div className="relative z-10 grid h-full items-center md:grid-cols-2">
                    <div
                      className={`flex max-w-xl flex-col gap-4 p-6 sm:p-8 ${
                        index % 2 === 0
                          ? 'md:col-start-1'
                          : 'md:col-start-2 md:justify-self-end md:text-right'
                      }`}
                    >
                      <div className="space-y-3">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
                          {formatDate(project.date)}
                        </p>
                        <h3 className="font-serif text-3xl leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                          {project.title}
                        </h3>
                      </div>
                      <p className="text-base leading-8 text-foreground/55">
                        {project.summary}
                      </p>
                      {project.stack.length > 0 ? (
                        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                          {project.stack.slice(0, 5).join(' · ')}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground/50">
            More detail, process notes, and project timelines live in{' '}
            <Link
              to="/projects"
              className="text-primary transition-colors hover:text-primary/80"
            >
              the full projects archive
            </Link>
            .
          </p>
        </Section>
      </motion.div>

      <motion.div
        variants={item}
        className="grid gap-16 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
      >
        <Section title="blogs">
          <div className="grid gap-1">
            {featuredPosts.map((post: BlogMeta) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group grid gap-3 rounded-xl px-1 py-5 transition-colors duration-300 sm:grid-cols-[100px_minmax(0,1fr)] sm:gap-6"
              >
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                  {formatDate(post.date)}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold leading-tight tracking-tight transition-colors duration-300 group-hover:text-primary">
                    {post.title}
                  </h3>
                  <p className="text-sm leading-7 text-foreground/45">
                    {post.summary}
                  </p>
                  {post.tags.length > 0 ? (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                      {post.tags.slice(0, 3).join(' · ')}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground/45">
            Short notes and build logs continue in{' '}
            <Link
              to="/blog"
              className="text-primary transition-colors hover:text-primary/80"
            >
              the writing index
            </Link>
            .
          </p>
        </Section>

        <Section title="healthstat">
          <div className="grid gap-8">
            <div className="flex flex-col divide-y divide-border/20">
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

            <Link to="/readme" className="block">
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
        className="grid gap-16 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]"
      >
        <Section title="pinterest">
          {featuredPins.length > 0 ? (
            <div className="flex flex-col gap-6">
              <div className="columns-2 gap-4 sm:columns-3">
                {featuredPins.map((pin: PinterestCreatedPin) => (
                  <a
                    key={pin.id}
                    href={pin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="media-hover-parent group mb-4 block break-inside-avoid"
                  >
                    <figure className="relative overflow-hidden rounded-3xl bg-muted/20">
                      <img
                        src={pin.imageUrl}
                        alt={pin.title}
                        loading="lazy"
                        width={pin.imageWidth}
                        height={pin.imageHeight}
                        className="media-hover-image media-hover-desaturate media-hover-fade h-auto w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/78 via-transparent to-transparent" />
                      <figcaption className="absolute inset-x-0 bottom-0 p-3 text-[11px] leading-6 text-white/90">
                        {pin.title}
                      </figcaption>
                    </figure>
                  </a>
                ))}
              </div>
              <p className="text-sm text-muted-foreground/45">
                The mobile version now keeps these pins in full color by
                default. Browse more in the{' '}
                <Link
                  to="/pinterest"
                  className="text-primary transition-colors hover:text-primary/80"
                >
                  full Pinterest gallery
                </Link>
                .
              </p>
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
        </Section>

        <Section title="certificates">
          <div className="grid gap-1">
            {featuredCertificates.map((cert: CertificateMeta) => (
              <Link
                key={cert.id}
                to="/certificates/$slug"
                params={{ slug: cert.slug }}
                className="group grid gap-3 rounded-xl px-1 py-4 text-sm transition-colors duration-300 sm:grid-cols-[minmax(0,1fr)_120px]"
              >
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-primary/50">
                    {cert.issuer}
                  </p>
                  <h3 className="text-base font-semibold leading-7 tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                    {cert.title}
                  </h3>
                  {cert.skills.length > 0 ? (
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                      {cert.skills.slice(0, 3).join(' · ')}
                    </p>
                  ) : null}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40 sm:text-right">
                  {cert.issued}
                </div>
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground/45">
            A longer credential ledger lives in{' '}
            <Link
              to="/certificates"
              className="text-primary transition-colors hover:text-primary/80"
            >
              the certificates page
            </Link>
            .
          </p>
        </Section>
      </motion.div>

      <motion.div variants={item}>
        <GamesCinematic gamesData={gamesData} />
      </motion.div>

      <motion.div variants={item}>
        <Section title="contact">
          <div className="relative overflow-hidden rounded-3xl pb-8">
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

            <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-end">
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
                  <p className="max-w-3xl text-base leading-8 text-foreground/50 sm:text-lg">
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

                <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center">
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
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                      public profile
                    </p>
                    <p className="max-w-2xl text-sm leading-7 text-foreground/50">
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

              <div className="grid gap-0">
                <Link
                  to="/readme"
                  className="flex items-center justify-between gap-4 border-b border-border/10 py-4 text-sm leading-7 text-foreground/55 transition-colors duration-300 hover:text-primary"
                >
                  <span className="font-medium">README</span>
                  <span className="text-muted-foreground/35 text-xs">reference</span>
                </Link>
                <Link
                  to="/resume"
                  className="flex items-center justify-between gap-4 border-b border-border/10 py-4 text-sm leading-7 text-foreground/55 transition-colors duration-300 hover:text-primary"
                >
                  <span className="font-medium">Resume</span>
                  <span className="text-muted-foreground/35 text-xs">experience</span>
                </Link>
                <Link
                  to="/blog"
                  className="flex items-center justify-between gap-4 border-b border-border/10 py-4 text-sm leading-7 text-foreground/55 transition-colors duration-300 hover:text-primary"
                >
                  <span className="font-medium">Writing</span>
                  <span className="text-muted-foreground/35 text-xs">notes</span>
                </Link>
                <a
                  href={gravatar.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="flex items-center justify-between gap-4 py-4 text-sm leading-7 text-foreground/55 transition-colors duration-300 hover:text-primary"
                >
                  <span className="font-medium">Gravatar</span>
                  <span className="text-muted-foreground/35 text-xs">identity</span>
                </a>
              </div>
            </div>
          </div>
        </Section>
      </motion.div>

      <motion.p
        variants={item}
        className="flex flex-col items-center justify-between gap-1 text-center font-mono text-[10px] tracking-[0.2em] text-muted-foreground/30 sm:flex-row sm:text-left"
      >
        <span>Yes, this portfolio can run DOOM.</span>
        <span>Konami Code: ↑ ↑ ↓ ↓ ← → ← → b a</span>
      </motion.p>
    </motion.div>
  )
}
