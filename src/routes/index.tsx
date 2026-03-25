import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { useEffect, useState } from 'react'
import type { BlogMeta, ProjectMeta } from '@/lib/content'
import type { HealthSample } from '@/lib/health'
import { Section, StatCard } from '@/components/functions'
import { KeyboardHint } from '@/components/CommandMenu'
import GitHubHeatmap from '@/components/GitHubHeatmap'
import GravatarAvatar from '@/components/gravatar/GravatarAvatar'
import CalendarIcon from '@/components/ui/calendar-icon'
import { gravatarConfig } from '@/config/gravatar'
import {
  contactLinks,
  gravatar,
  previousRoles,
  siteImages,
  siteInfo,
  siteMeta,
} from '@/config/site-data'
import { getBlogIndex, getProjectIndex } from '@/lib/content'
import { formatDate } from '@/lib/format'
import { hashEmail } from '@/lib/gravatar'
import { getHealthData } from '@/lib/health'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [posts, projects, health, avatarHash] = await Promise.all([
      getBlogIndex(),
      getProjectIndex(),
      getHealthData(),
      hashEmail(gravatarConfig.email),
    ])

    return {
      posts,
      projects,
      health,
      avatarHash,
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
  const { posts, projects, health, avatarHash } = Route.useLoaderData()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  const professionalServiceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: siteInfo.name,
    image: `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
    url: siteMeta.baseUrl,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Prayagraj',
      addressRegion: 'Uttar Pradesh',
      addressCountry: 'IN',
    },
    priceRange: '$$',
    description: siteMeta.defaultDescription,
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(professionalServiceJsonLd),
        }}
      />
      <motion.section variants={item} className="flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row item-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href={gravatar.profileUrl}
              target="_blank"
              rel="noopener noreferrer me"
              className="shrink-0"
            >
              <GravatarAvatar
                hash={avatarHash}
                size={48}
                alt={`${siteInfo.name} — Profile Photo`}
                className="w-12 h-12"
                rel="me"
              />
            </a>
            <div className="flex flex-col sm:flex-row justify-between items-baseline sm:min-w-xl">
              <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-semibold italic">
                  {siteInfo.name} ~{' '}
                  <span className="text-sm mb-1 align-bottom inline-flex leading-4">
                    {siteInfo.nativeName}
                  </span>
                </h1>
                <h2 className="text-xs tracking-tight border w-fit p-0.5 rounded-xs text-primary font-sans border-border">
                  {siteInfo.tagline}
                </h2>
              </div>
              <div className="flex flex-col sm:items-end text-[10px] sm:text-xs uppercase tracking-[0.3em] text-primary mt-1.5">
                <span>{siteInfo.location}</span>
                <span className="italic tracking-wide text-foreground">
                  {siteInfo.locationNative}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <motion.p whileHover={{ x: 5 }} className="italic cursor-default">
            <span className="not-italic font-medium">i build</span>{' '}
            <span className="underline decoration-primary underline-offset-4 font-black">
              {siteInfo.buildLine}
            </span>
          </motion.p>
          <KeyboardHint />
        </div>
      </motion.section>

      <motion.div variants={item}>
        <Section title="current">
          <motion.p whileHover={{ x: 3 }}>
            {siteInfo.currentRole} at{' '}
            <motion.a
              whileHover={{ scale: 1.05, y: -2 }}
              href={siteInfo.currentCompanyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-2 py-0.5 rounded-sm font-black italic underline decoration-primary underline-offset-1 bg-foreground text-background"
            >
              <img
                src="/khub.jpg"
                alt="KarkhanaHub Logo"
                width={24}
                height={24}
                loading="lazy"
                className="inline-block w-6 h-6 mr-2 rounded-sm object-cover"
              />
              {siteInfo.currentCompany}
            </motion.a>
            . {siteInfo.currentSummary}
          </motion.p>
          <motion.p whileHover={{ x: 3 }}>{siteInfo.educationLine}</motion.p>
          <motion.p whileHover={{ x: 3 }}>{siteInfo.interests}</motion.p>
          <motion.p whileHover={{ x: 3 }} className="space-x-4">
            i can build{' '}
            <span className="italic font-black underline underline-offset-2 decoration-primary text-primary">
              literally anything.
            </span>
            <img
              src="/frieren/party.svg"
              className="h-6 sm:h-8 inline-block align-bottom"
            />
          </motion.p>
        </Section>
      </motion.div>

      <motion.div variants={item}>
        <Section title="">
          <div className="flex flex-col gap-4">
            <Link
              to="/readme"
              className="block overflow-hidden transition-all hover:border-primary/50"
            >
              <GitHubHeatmap username="Mic-360" />
            </Link>
            <p className="text-xs italic text-muted-foreground">
              click the graph to view my full github readme.
            </p>
          </div>
        </Section>
      </motion.div>

      <motion.div variants={item}>
        <Section title="previous">
          <div className="flex flex-col gap-2">
            {previousRoles.map((role) => (
              <motion.div
                key={role.company}
                whileHover={{ x: 5 }}
                className="flex flex-wrap justify-between gap-2"
              >
                <div className="flex flex-wrap gap-2 items-center">
                  <a
                    href={role.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-primary underline-offset-4"
                  >
                    {role.icon && (
                      <img
                        src={role.icon}
                        alt={role.company}
                        width={24}
                        height={24}
                        loading="lazy"
                        className="inline-block w-6 h-6 mr-1 mb-0.5 rounded-md object-cover"
                      />
                    )}
                    {role.company}
                  </a>
                  <span className="text-primary">~</span>
                  <span>{role.role}</span>
                  <span className="text-primary">[{role.location}]</span>
                </div>
                <span>[{role.duration}]</span>
              </motion.div>
            ))}
          </div>
        </Section>
      </motion.div>

      <motion.div variants={item}>
        <Section title="blogs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {posts.slice(0, 6).map((post: BlogMeta) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                className="group ac-game-card animus-corner bg-card/15 border border-border/30 hover:border-primary/50 transition-all duration-300"
              >
                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] text-primary/80 font-mono uppercase tracking-[0.2em]">
                    {formatDate(post.date)}
                  </span>
                  <h3 className="text-base font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-[10px] text-secondary-foreground line-clamp-2 italic leading-relaxed">
                    {post.summary}
                  </p>
                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="text-[9px] text-muted-foreground font-mono tracking-tighter uppercase"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </motion.div>

      <motion.div variants={item}>
        <Section title="projects">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.slice(0, 4).map((project: ProjectMeta) => (
              <Link
                key={project.slug}
                to="/projects/$slug"
                params={{ slug: project.slug }}
                className="group animus-corner relative h-56 flex flex-col justify-end p-4 border border-border/20 bg-card/10 hover:border-primary/50 transition-all duration-500 overflow-hidden"
              >
                {project.image && (
                  <>
                    <img
                      src={project.image}
                      alt={project.title}
                      className="absolute inset-0 w-full h-full object-contain opacity-40 group-hover:grayscale group-hover:opacity-60 transition-all duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
                  </>
                )}

                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold tracking-tight text-white group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <span className="text-[9px] text-primary font-mono uppercase tracking-[0.2em]">
                      {formatDate(project.date)}
                    </span>
                  </div>

                  <p className="text-xs text-white/70 line-clamp-2 leading-relaxed italic">
                    {project.summary}
                  </p>

                  {project.stack.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.stack.slice(0, 4).map((tech) => (
                        <span
                          key={tech}
                          className="text-[8px] px-1.5 py-0.5 rounded-xs bg-white/10 text-white/80 border border-white/20 font-mono tracking-tighter backdrop-blur-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Section>
      </motion.div>

      <motion.div variants={item}>
        <Section title="healthstat">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
              label="steps"
              samples={sanitizeSamples(health.steps)}
              unit="steps"
              type="sum"
            />
            <StatCard
              label="energy"
              samples={sanitizeSamples(health.activeEnergy)}
              unit="kcal"
              type="sum"
              format={(v) => formatMetricValue(v, 0)}
            />
            <StatCard
              label="heart rate"
              samples={sanitizeSamples<HealthSample>(health.heartRate).map(
                (s) => {
                  const val = Number(s.value)
                  const start = new Date(s.startDate).getTime()
                  const end = new Date(s.endDate).getTime()
                  const minutes = (end - start) / (1000 * 60)

                  // If value is > 500, it's likely total beats in that period, calculate BPM
                  // Otherwise treat as raw BPM
                  const bpm = val > 300 && minutes > 0 ? val / minutes : val

                  return {
                    ...s,
                    value: bpm,
                  } as HealthSample & { value: number }
                },
              )}
              unit="bpm"
              type="avg"
              format={(v) => formatMetricValue(v, 0)}
            />
            <StatCard
              label="distance"
              samples={sanitizeSamples(health.distance)}
              unit="km"
              type="sum"
              format={(v) => formatMetricValue(v, 2)}
            />
            <StatCard
              label="sleep"
              samples={sanitizeSamples(health.sleep)}
              unit="hrs"
              type="sum"
              format={(v) => formatMetricValue(v, 1)}
            />
            <StatCard
              label="spO2"
              samples={sanitizeSamples(health.spO2)}
              unit="%"
              type="avg"
              format={(v) => formatMetricValue(v, 1)}
            />
          </div>
          {health.updatedAt && isMounted && (
            <p className="text-[10px] italic text-muted-foreground mt-4">
              last updated: {new Date(health.updatedAt).toLocaleString()}
            </p>
          )}
        </Section>
      </motion.div>

      <motion.div variants={item}>
        <Section title="contact">
          <div className="flex items-baseline gap-2 relative">
            <p>
              interested to talk? read my{' '}
              {contactLinks.map((link, i) => (
                <span key={link.label}>
                  <Link
                    to={link.url}
                    className="underline decoration-primary underline-offset-4"
                    rel="me"
                  >
                    {link.label}
                  </Link>
                  {i < contactLinks.length - 1 ? ', ' : ' '}
                </span>
              ))}
              or book a call with me on
              <button
                data-cal-namespace="connect"
                data-cal-link={siteInfo.calLink}
                data-cal-config='{"layout":"week_view","useSlotsViewOnSmallScreen":"true"}'
                className="underline decoration-primary pl-1 inline-flex items-center gap-1 group cursor-pointer"
              >
                cal.com
                <CalendarIcon
                  size={16}
                  className="inline-block mr-1 mb-0.5 text-primary"
                />
              </button>
              .
            </p>
            <img
              src="/frieren/fern.svg"
              className="h-16 sm:h-22 inline-block absolute -right-4 -top-6 sm:-top-4 transform -translate-y-1/2"
            />
          </div>
        </Section>
        <p className="mt-4 text-center font-mono text-[10px] tracking-widest text-muted-foreground/40 select-none flex flex-col sm:flex-row items-center gap-1 justify-between">
          <span>Yes, This portfolio can run DOOM</span>
          <span className="text-md">Konami Code: ↑ ↑ ↓ ↓ ← → ← → b a</span>
        </p>
      </motion.div>
    </motion.div>
  )
}
