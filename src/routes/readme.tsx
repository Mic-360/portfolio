import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import type React from 'react'
import type { ImgHTMLAttributes } from 'react'

import { LinkPreview } from '@/components/ui/link-preview'
import { siteImages, siteMeta } from '@/config/site-data'

import GithubIcon from '@/components/ui/github-icon'
import InstagramIcon from '@/components/ui/instagram-icon'
import LinkedinIcon from '@/components/ui/linkedin-icon'
import TwitterIcon from '@/components/ui/twitter-icon'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  GitHub: GithubIcon,
  Instagram: InstagramIcon,
  LinkedIn: LinkedinIcon,
  X: TwitterIcon,
}

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
        staggerChildren: 0.12,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] as const },
    },
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
      className="mx-auto flex w-full max-w-375 flex-col gap-20 md:gap-28 px-4 sm:px-6"
    >
      <motion.section variants={item} className="pb-12">
        <div className="flex items-center justify-between gap-4 pb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            README
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground/70 transition-colors duration-300 hover:text-foreground"
          >
            <span>←</span>
            Home
          </Link>
        </div>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4">
              <ReadmeImage
                src={siteImages.profilePhoto}
                alt="Bhaumic Singh — Profile Photo"
                width={48}
                height={48}
                className="h-12 w-12 rounded-full ring-1 ring-border/20 object-cover"
              />
              <div>
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  Bhaumic Singh
                </p>
                <LinkPreview
                  url="https://github.com/Mic-360"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-muted-foreground/70 transition-colors duration-300 hover:text-foreground"
                >
                  github.com/Mic-360
                </LinkPreview>
              </div>
            </div>

            <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Public work, stack, and the systems behind it.
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-muted-foreground/70">
              A refined version of the GitHub README — clearer sections and a
              stronger editorial rhythm around code, tools, and output.
            </p>

            <div className="flex items-center gap-6 text-sm text-muted-foreground/70">
              <span>Web · Android · AI · Cloud</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl bg-foreground/2 p-4">
            <ReadmeImage
              src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=mic-360&theme=transparent"
              alt="GitHub profile summary"
              width={495}
              height={195}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>

        <div className="mt-8 h-px w-full bg-border/10" />
      </motion.section>

      <motion.section variants={item} className="grid gap-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
          Profile Summary
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          {summaryCards.map((card) => (
            <div
              key={card.key}
              className="overflow-hidden rounded-2xl border border-border/10 bg-foreground/1 p-5 transition-all duration-300 hover:border-border/20 hover:bg-foreground/3"
            >
              <p className="mb-3 text-xs text-muted-foreground/70 capitalize">
                {card.label}
              </p>
              <ReadmeImage
                src={card.src}
                alt={card.label}
                width={495}
                height={195}
                className="h-auto w-full object-contain"
              />
            </div>
          ))}
        </div>
      </motion.section>

      <motion.section variants={item} className="grid gap-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
          Contribution Map
        </p>

        <div className="overflow-hidden rounded-2xl border border-border/10 bg-foreground/1 p-5">
          <ReadmeImage
            src="https://raw.githubusercontent.com/Mic-360/Mic-360/main/github-metrics.svg"
            alt="Contributions Metrics"
            width={1200}
            height={480}
            className="h-auto w-full object-contain"
          />
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(240px,0.9fr)]"
      >
        <div className="grid gap-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
            Languages &amp; Tools
          </p>

          <div className="grid grid-cols-4 gap-4 sm:grid-cols-5 lg:grid-cols-5">
            {toolIcons.map((icon) => (
              <div
                key={icon.alt}
                className="flex flex-col items-center gap-2.5 rounded-xl p-3 text-center transition-colors duration-300 hover:bg-foreground/3"
              >
                <ReadmeImage
                  src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${icon.src}`}
                  alt={icon.alt}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
                <span className="text-[10px] text-muted-foreground/70">
                  {icon.alt}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
            Workspace
          </p>

          <div className="grid gap-0">
            {workspace.map((itemLabel) => (
              <div
                key={itemLabel}
                className="border-b border-border/10 py-3 text-sm text-foreground/70"
              >
                {itemLabel}
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="relative overflow-hidden rounded-3xl"
      >
        <img
          src="https://raw.githubusercontent.com/Mic-360/Mic-360/main/space-shooter.gif"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-background/70 backdrop-blur-xs" />

        <div className="relative flex flex-col items-center gap-6 px-6 py-16 text-center sm:py-20">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
            Connect
          </p>
          <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-foreground">
            Follow the work.
          </h2>
          <p className="max-w-lg text-base text-muted-foreground/60">
            Repositories, profiles, and the rest of the portfolio.
          </p>

          <div className="grid grid-cols-4 w-full max-w-sm gap-2 items-center">
            {socials.map((social) => {
              const Icon = iconMap[social.label]
              return (
                <LinkPreview
                  key={social.label}
                  url={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex text-foreground transition-colors duration-300 hover:text-primary items-center justify-center gap-2 py-3"
                >
                  <Icon className="h-5 w-5 text-muted-foreground/70" />
                </LinkPreview>
              )
            })}
          </div>
        </div>
      </motion.section>

      <motion.footer variants={item}>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm text-muted-foreground/60 transition-all duration-300 hover:text-foreground"
        >
          ← Home
        </Link>
      </motion.footer>
    </motion.article>
  )
}
