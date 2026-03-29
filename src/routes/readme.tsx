import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import type { ImgHTMLAttributes } from 'react'

import { siteImages, siteMeta } from '@/config/site-data'

export const Route = createFileRoute('/readme')({
  head: () => {
    const title = `README | ${siteMeta.defaultTitle}`
    const description =
      'GitHub profile, stats, languages, tools, and technical overview of Bhaumic Singh.'
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`
    const canonicalUrl = `${siteMeta.baseUrl}/readme`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'profile' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
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
                name: 'README',
                item: canonicalUrl,
              },
            ],
          }),
        },
      ],
    }
  },
  component: ReadmePage,
})

type ReadmeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  width: number
  height: number
}

function ReadmeImage({
  width,
  height,
  loading = 'eager',
  decoding = 'async',
  className,
  ...props
}: ReadmeImageProps) {
  return (
    <img
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      className={className}
      {...props}
    />
  )
}

function ReadmePage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  }

  const summaryCards = [
    {
      key: 'stats',
      label: 'stats',
      src: 'https://github-profile-summary-cards.vercel.app/api/cards/stats?username=mic-360&theme=transparent',
    },
    {
      key: 'repos-per-language',
      label: 'repos per language',
      src: 'https://github-profile-summary-cards.vercel.app/api/cards/repos-per-language?username=mic-360&theme=transparent',
    },
    {
      key: 'most-commit-language',
      label: 'most commit language',
      src: 'https://github-profile-summary-cards.vercel.app/api/cards/most-commit-language?username=mic-360&theme=transparent',
    },
    {
      key: 'productive-time',
      label: 'productive time',
      src: 'https://github-profile-summary-cards.vercel.app/api/cards/productive-time?utcOffset=5.30&username=mic-360&theme=transparent',
    },
  ]

  const toolIcons = [
    { src: 'nextjs/nextjs-original.svg', alt: 'Next.js' },
    { src: 'react/react-original.svg', alt: 'React' },
    { src: 'nodejs/nodejs-original.svg', alt: 'Node.js' },
    { src: 'bun/bun-original.svg', alt: 'Bun' },
    { src: 'git/git-original.svg', alt: 'Git' },
    { src: 'cloudflare/cloudflare-original.svg', alt: 'Cloudflare' },
    { src: 'typescript/typescript-original.svg', alt: 'TypeScript' },
    { src: 'android/android-plain.svg', alt: 'Android' },
    { src: 'flutter/flutter-original.svg', alt: 'Flutter' },
    { src: 'googlecloud/googlecloud-original.svg', alt: 'Google Cloud' },
    { src: 'python/python-original.svg', alt: 'Python' },
    { src: 'ubuntu/ubuntu-original.svg', alt: 'Ubuntu' },
    { src: 'java/java-original.svg', alt: 'Java' },
    { src: 'go/go-original.svg', alt: 'Go' },
    { src: 'rust/rust-original.svg', alt: 'Rust' },
    { src: 'terraform/terraform-original.svg', alt: 'Terraform' },
    { src: 'astro/astro-original.svg', alt: 'Astro' },
    { src: 'redis/redis-original.svg', alt: 'Redis' },
    { src: 'graphql/graphql-plain.svg', alt: 'GraphQL' },
    { src: 'firebase/firebase-original.svg', alt: 'Firebase' },
  ]

  const workspace = [
    'Android 13',
    'ASUS ROG Flow',
    'Windows 11 Insider',
    'Ubuntu 24.04',
    'AMD Ryzen 9 5980HS',
    '32GB RAM',
  ]

  const socials = [
    { href: 'https://github.com/Mic-360', label: 'GitHub' },
    { href: 'https://www.linkedin.com/in/bhaumic/', label: 'LinkedIn' },
    { href: 'https://x.com/bhaumicsingh', label: 'X' },
    { href: 'https://www.instagram.com/bhaumic.singh/', label: 'Instagram' },
  ]

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-[1500px] flex-col gap-14"
    >
      <motion.section
        variants={item}
        className="relative min-h-[580px] overflow-hidden"
      >
        <div className="pointer-events-none absolute inset-x-[16%] top-[14%] h-28 rounded-full bg-primary/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[12%] h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />

        <div className="grid min-h-[580px] gap-10 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-end">
          <div className="flex flex-col gap-7 pt-8 lg:pt-12">
            <div className="flex items-center gap-4">
              <div className="relative h-20 w-20 shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/16 blur-xl" />
                <ReadmeImage
                  src={siteImages.profilePhoto}
                  alt="Bhaumic Singh — Profile Photo"
                  width={80}
                  height={80}
                  className="relative h-20 w-20 rounded-full border border-primary/35 object-cover"
                />
              </div>
              <div className="grid gap-1 text-sm text-foreground/72">
                <span className="text-[10px] uppercase tracking-[0.28em] text-primary/75">
                  readme
                </span>
                <span>Bhaumic Singh</span>
              </div>
            </div>

            <div className="grid gap-4">
              <p className="text-[10px] uppercase tracking-[0.28em] text-primary/75">
                technical dossier
              </p>
              <h1 className="max-w-xl font-serif text-5xl leading-none text-foreground sm:text-6xl">
                Public work, stack, and the systems behind it.
              </h1>
              <p className="max-w-lg text-base leading-8 text-foreground/76">
                A refined version of the GitHub README, shaped to match the
                homepage: fewer widget boxes, clearer sections, and a stronger
                editorial rhythm around code, tools, and output.
              </p>
            </div>

            <div className="grid gap-4 border-t border-border/25 pt-5 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  profile
                </p>
                <a
                  href="https://github.com/Mic-360"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/78 transition-colors hover:text-primary"
                >
                  github.com/Mic-360
                </a>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  focus
                </p>
                <p className="text-sm text-foreground/78">
                  web, android, AI, cloud
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[340px] lg:min-h-[450px]">
            <div className="pointer-events-none absolute inset-y-[8%] right-[4%] w-[84%] border-l border-primary/18" />
            <ReadmeImage
              src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=mic-360&theme=transparent"
              alt="GitHub profile summary"
              width={495}
              height={195}
              className="hero-blend-media media-hover-image media-hover-fade absolute inset-y-[8%] right-0 h-[84%] w-[96%] object-contain"
            />
            <div className="hero-grid-overlay absolute inset-y-[12%] right-[4%] w-[80%]" />
          </div>
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-8">
        <div className="flex items-center gap-4">
          <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
            profile summary
          </p>
          <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
        </div>

        <div className="divide-y divide-border/25">
          {summaryCards.map((card, index) => (
            <div
              key={card.key}
              className="group relative min-h-[210px] py-7 first:pt-0 last:pb-0"
            >
              <div
                className={`media-hover-parent pointer-events-none absolute inset-y-0 ${
                  index % 2 === 0 ? 'left-[24%] right-0' : 'left-0 right-[24%]'
                }`}
              >
                <ReadmeImage
                  src={card.src}
                  alt={card.label}
                  width={495}
                  height={195}
                  className="media-hover-image media-hover-fade absolute inset-0 h-full w-full object-contain"
                />
                <div
                  className={`absolute inset-0 ${
                    index % 2 === 0
                      ? 'bg-linear-to-r from-background via-background/64 to-transparent'
                      : 'bg-linear-to-l from-background via-background/64 to-transparent'
                  }`}
                />
              </div>

              <div className="relative z-10 grid h-full items-center md:grid-cols-2">
                <div
                  className={`flex max-w-md flex-col gap-3 ${
                    index % 2 === 0
                      ? 'md:col-start-1'
                      : 'md:col-start-2 md:justify-self-end md:text-right'
                  }`}
                >
                  <p className="text-[10px] uppercase tracking-[0.24em] text-primary/75">
                    {card.label}
                  </p>
                  <h2 className="font-serif text-3xl leading-tight text-foreground">
                    {card.label === 'stats' &&
                      'A quick read on activity and footprint.'}
                    {card.label === 'repos per language' &&
                      'Language mix across active repositories.'}
                    {card.label === 'most commit language' &&
                      'Where the heaviest implementation time went.'}
                    {card.label === 'productive time' &&
                      'When most of the visible work actually happens.'}
                  </h2>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-6">
        <div className="flex items-center gap-4">
          <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
            contribution map
          </p>
          <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
        </div>

        <div className="relative min-h-[320px] overflow-hidden">
          <ReadmeImage
            src="https://raw.githubusercontent.com/Mic-360/Mic-360/main/github-metrics.svg"
            alt="Contributions Metrics"
            width={1200}
            height={480}
            className="media-hover-image media-hover-fade h-full w-full object-contain"
          />
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-10 lg:grid-cols-[minmax(0,1.08fr)_minmax(260px,0.92fr)]"
      >
        <div className="grid gap-6">
          <div className="flex items-center gap-4">
            <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
              languages and tools
            </p>
            <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
          </div>

          <div className="grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-4 lg:grid-cols-5">
            {toolIcons.map((icon) => (
              <div
                key={icon.alt}
                className="media-hover-parent flex flex-col items-center gap-3 text-center"
              >
                <ReadmeImage
                  src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${icon.src}`}
                  alt={icon.alt}
                  width={44}
                  height={44}
                  className="media-hover-image h-11 w-11 object-contain"
                />
                <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  {icon.alt}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <div className="flex items-center gap-4">
            <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
              workspace
            </p>
            <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
          </div>

          <div className="divide-y divide-border/25">
            {workspace.map((itemLabel) => (
              <div
                key={itemLabel}
                className="py-3 text-sm leading-7 text-foreground/76"
              >
                {itemLabel}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-10 lg:grid-cols-[minmax(0,0.94fr)_minmax(0,1.06fr)] lg:items-end"
      >
        <div className="grid gap-4">
          <p className="text-[10px] uppercase tracking-[0.26em] text-primary/75">
            public links
          </p>
          <h2 className="max-w-lg font-serif text-4xl leading-tight text-foreground">
            The social version of the work stays here.
          </h2>
          <p className="max-w-lg text-base leading-8 text-foreground/76">
            Follow the repositories, connect directly, or browse the rest of the
            portfolio.
          </p>

          <div className="divide-y divide-border/25">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 py-3 text-sm transition-colors hover:text-primary"
              >
                <span>{social.label}</span>
                <span className="text-muted-foreground">↗</span>
              </a>
            ))}
          </div>
        </div>

        <div className="media-hover-parent relative min-h-[280px] overflow-hidden">
          <ReadmeImage
            src="https://raw.githubusercontent.com/Mic-360/Mic-360/main/space-shooter.gif"
            alt="Space Shooter"
            width={640}
            height={360}
            className="hero-blend-media media-hover-image media-hover-fade h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-r from-background/20 via-transparent to-transparent" />
        </div>
      </motion.section>

      <motion.footer variants={item} className="border-t border-border/25 pt-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          ← back
        </Link>
      </motion.footer>
    </motion.article>
  )
}
