import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

import type { GravatarInterest, GravatarLink } from '@/types/gravatar'
import GravatarAvatar from '@/components/gravatar/GravatarAvatar'
import GravatarGallery from '@/components/gravatar/GravatarGallery'
import GravatarSocialLinks from '@/components/gravatar/GravatarSocialLinks'
import { LinkPreview } from '@/components/ui/link-preview'
import { gravatarConfig } from '@/config/gravatar'
import { siteMeta } from '@/config/site-data'
import { getGravatarProfile } from '@/lib/gravatar-profile'

export const Route = createFileRoute('/about')({
  loader: async () => {
    const profile = await getGravatarProfile({
      data: gravatarConfig.slug,
    })
    return { profile }
  },
  head: () => {
    const title = `About | ${siteMeta.defaultTitle}`
    const description =
      'Learn more about Bhaumic Singh — software engineer, builder, and technology enthusiast. Identity powered by Gravatar.'
    const canonicalUrl = `${siteMeta.baseUrl}/about`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'profile' },
        { property: 'og:url', content: canonicalUrl },
        {
          property: 'og:image',
          content: `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
        },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:alt', content: title },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        {
          name: 'twitter:image',
          content: `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
        },
        { name: 'twitter:image:alt', content: title },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'AboutPage',
            name: 'About Bhaumic Singh',
            description,
            url: canonicalUrl,
            mainEntity: {
              '@type': 'Person',
              name: 'Bhaumic Singh',
              url: siteMeta.baseUrl,
            },
          }),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteMeta.baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'About',
                item: canonicalUrl,
              },
            ],
          }),
        },
      ],
    }
  },
  component: AboutPage,
})

function AboutPage() {
  const { profile } = Route.useLoaderData()

  if (!profile) {
    return (
      <article className="flex min-h-[60vh] flex-col items-center justify-center gap-6">
        <header className="flex flex-col gap-4 text-center">
          <h1 className="font-serif text-3xl text-foreground">about</h1>
          <p className="text-muted-foreground">
            unable to load profile data. please try again later.
          </p>
        </header>
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          ← back
        </Link>
      </article>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 28 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as const,
      },
    },
  }

  return (
    <motion.article
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 sm:px-6"
    >
      <motion.section
        variants={itemVariants}
        className="relative min-h-140 overflow-hidden rounded-3xl"
      >
        <div
          className="absolute inset-0"
          style={{
            background: profile.header_image || 'var(--primary)',
            backgroundColor: profile.background_color || 'var(--primary)',
            opacity: 0.88,
          }}
        />
        <div className="absolute inset-0 bg-linear-to-br from-background/88 via-background/42 to-black/72" />
        <div className="pointer-events-none absolute inset-x-[18%] top-[10%] h-28 rounded-full bg-primary/12 blur-3xl" />
        <div className="pointer-events-none absolute left-[8%] top-[20%] h-px w-[34%] bg-white/14" />
        <div className="pointer-events-none absolute right-[10%] top-[22%] h-px w-[22%] bg-white/10" />

        <div className="relative z-10 flex min-h-140 flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-6 text-[10px] uppercase tracking-[0.2em] text-white/45">
            <span>about</span>
            <span>subject_{profile.hash.substring(0, 6)}</span>
          </div>

          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)] lg:items-end">
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-4">
                <LinkPreview
                  url={profile.profile_url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="shrink-0"
                >
                  <GravatarAvatar
                    hash={profile.hash}
                    size={112}
                    alt={profile.display_name}
                    className="h-24 w-24 border border-white/20 shadow-2xl sm:h-28 sm:w-28"
                  />
                </LinkPreview>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/40">
                    identity
                  </p>
                  <h1 className="mt-3 font-serif text-4xl leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-6xl">
                    {profile.display_name}
                  </h1>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/70">
                {profile.job_title ? (
                  <span>
                    {profile.job_title}
                    {profile.company ? ` at ${profile.company}` : ''}
                  </span>
                ) : null}
                {profile.location ? (
                  <span className="text-white/54">{profile.location}</span>
                ) : null}
              </div>

              {profile.description ? (
                <p className="max-w-2xl text-base leading-8 text-white/82 sm:text-lg">
                  {profile.description}
                </p>
              ) : null}

              {profile.verified_accounts?.length ? (
                <GravatarSocialLinks
                  accounts={profile.verified_accounts}
                  iconSize={22}
                  className="gap-4 invert-0"
                />
              ) : null}
            </div>

            <div className="grid gap-4 border-t border-white/12 pt-5 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-white/54">
                  profile
                </p>
                <LinkPreview
                  url={profile.profile_url}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="text-sm text-white/80 transition-colors hover:text-white"
                >
                  view source profile
                </LinkPreview>
              </div>
              {profile.registration_date ? (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/54">
                    enlisted
                  </p>
                  <p className="text-sm text-white/80">
                    {new Date(profile.registration_date).getFullYear()}
                  </p>
                </div>
              ) : null}
              {profile.location ? (
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.24em] text-white/54">
                    base
                  </p>
                  <p className="text-sm text-white/80">{profile.location}</p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]"
      >
        {profile.interests && profile.interests.length > 0 ? (
          <div className="grid gap-4">
            <p className="text-[10px] uppercase tracking-[0.26em] text-primary/75">
              interests
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-3 text-sm leading-7 text-foreground/78">
              {profile.interests.map((interest: GravatarInterest) => (
                <span key={interest.id}>
                  #{interest.name.replace(/\s+/g, '_').toLowerCase()}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {profile.links && profile.links.length > 0 ? (
          <div className="grid gap-3">
            <p className="text-[10px] uppercase tracking-[0.26em] text-primary/75">
              external links
            </p>
            <div className="grid grid-cols-2 gap-4 divide-y divide-border/25">
              {profile.links.map((link: GravatarLink) => (
                <LinkPreview
                  key={link.url}
                  url={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:text-primary"
                >
                  <span>{link.label}</span>
                  <span className="text-muted-foreground">↗</span>
                </LinkPreview>
              ))}
            </div>
          </div>
        ) : null}
      </motion.section>

      {profile.gallery && profile.gallery.length > 0 ? (
        <motion.section variants={itemVariants} className="grid gap-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
            gallery
          </p>
          <GravatarGallery
            images={profile.gallery}
            className="grid-cols-2 gap-3 md:grid-cols-4"
          />
        </motion.section>
      ) : null}

      <motion.footer
        variants={itemVariants}
        className="flex flex-wrap items-center justify-between gap-4 pt-6 text-xs text-muted-foreground/70"
      >
        <span>identity powered by gravatar</span>
        <Link
          to="/"
          className="inline-flex items-center gap-1 transition-colors duration-300 hover:text-primary"
        >
          ← back
        </Link>
      </motion.footer>
    </motion.article>
  )
}
