import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

import { siteMeta } from '@/config/site-data'
import { getBlogPostBySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => ({
    post: await getBlogPostBySlug({ data: { slug: params.slug } }),
  }),
  head: ({ loaderData }) => {
    if (!loaderData?.post) {
      return {
        meta: [{ title: `Blog | ${siteMeta.defaultTitle}` }],
      }
    }

    const { post } = loaderData
    const title = `${post.title} | ${siteMeta.defaultTitle}`
    const description = post.summary
    const imageUrl = post.image
      ? `${siteMeta.baseUrl}${post.image}`
      : `${siteMeta.baseUrl}/og/blog/${post.slug}`
    const keywords = [...post.categories, ...post.tags].join(', ')
    const canonicalUrl = `${siteMeta.baseUrl}/blog/${post.slug}`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'keywords', content: keywords },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/svg+xml' },
        { property: 'og:image:alt', content: post.title },
        { property: 'article:published_time', content: post.date },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: post.title },
        ...post.categories.map((category) => ({
          property: 'article:section',
          content: category,
        })),
        ...post.tags.map((tag) => ({
          property: 'article:tag',
          content: tag,
        })),
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description: post.summary,
            datePublished: post.date,
            dateModified: post.date,
            image: imageUrl,
            mainEntityOfPage: { '@type': 'WebPage', '@id': canonicalUrl },
            author: {
              '@type': 'Person',
              name: siteMeta.siteName,
              url: siteMeta.baseUrl,
            },
            publisher: {
              '@type': 'Person',
              name: siteMeta.siteName,
              url: siteMeta.baseUrl,
            },
            keywords,
            inLanguage: 'en-US',
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
                name: 'Blog',
                item: `${siteMeta.baseUrl}/blog`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: canonicalUrl,
              },
            ],
          }),
        },
      ],
    }
  },
  component: BlogPost,
})

function BlogPost() {
  const { post } = Route.useLoaderData()

  if (!post) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="text-lg font-semibold italic">post not found</h1>
        <Link
          to="/blog"
          className="text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
        >
          back to blog
        </Link>
      </section>
    )
  }

  const readingTime = Math.max(
    1,
    Math.ceil(post.html.replace(/<[^>]*>/g, '').split(/\s+/).length / 200),
  )
  const detailRows = [
    {
      label: 'published',
      value: formatDate(post.date),
    },
    {
      label: 'reading time',
      value: `${readingTime} min read`,
    },
    {
      label: 'section',
      value:
        post.categories.length > 0 ? post.categories.join(' · ') : 'writing',
    },
    {
      label: 'topics',
      value: post.tags.length > 0 ? post.tags.join(' · ') : 'build notes',
    },
  ]
  const taxonomies = [...post.categories, ...post.tags]

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

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-[1500px] flex-col gap-14 pb-16"
    >
      <motion.section
        variants={item}
        className="relative overflow-hidden border-b border-border/20 pb-12"
      >
        <div className="pointer-events-none absolute inset-x-[16%] top-[10%] h-28 rounded-full bg-primary/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[12%] h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />

        <div className="flex items-center justify-between gap-4 pb-8">
          <p className="text-lg uppercase tracking-[0.28em] text-primary/75">
            essay dossier
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <span>←</span>
            archive
          </Link>
        </div>
        <div className="relative min-h-80 lg:min-h-130">
          <div className="hero-grid-overlay absolute inset-0" />

          <div className="relative z-10 flex flex-col gap-7 pt-6 lg:pt-10">
            <div className="grid gap-4">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                {formatDate(post.date)} · {readingTime} min read
              </p>
              <h1 className="font-serif text-5xl leading-none text-foreground sm:text-6xl xl:text-7xl">
                {post.title}
              </h1>
              <p className="text-base leading-8 text-foreground/76 sm:text-lg">
                {post.summary}
              </p>
            </div>

            <div className="grid gap-5 border-t border-border/25 pt-5 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  writing lane
                </p>
                <p className="text-sm leading-7 text-foreground/76">
                  {post.categories.length > 0
                    ? post.categories.join(' · ')
                    : 'essay'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                  quick read
                </p>
                <p className="text-sm leading-7 text-foreground/76">
                  Long-form notes, screenshots, and practical takeaways.
                </p>
              </div>
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.28em] text-foreground/48 z-20">
            <span>{post.slug}</span>
            <span>reading surface</span>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-12 lg:grid-cols-[minmax(220px,0.34fr)_minmax(0,0.66fr)]"
      >
        <aside className="grid content-start gap-10 lg:sticky lg:top-24">
          <div className="grid gap-5">
            <div className="flex items-center gap-4">
              <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
                reading rail
              </p>
              <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
            </div>

            <div className="divide-y divide-border/20">
              {detailRows.map((row) => (
                <div key={row.label} className="py-3 first:pt-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground/76">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {taxonomies.length > 0 ? (
            <div className="grid gap-5">
              <div className="flex items-center gap-4">
                <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
                  taxonomy
                </p>
                <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
              </div>

              <div className="divide-y divide-border/20">
                {taxonomies.map((entry, index) => (
                  <div
                    key={`${entry}-${index}`}
                    className="py-3 text-sm leading-7 text-foreground/76"
                  >
                    {entry}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div className="grid min-w-0 gap-6">
          <div className="flex items-center gap-4">
            <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
              article
            </p>
            <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
          </div>

          <div
            className="mdx-content min-w-0 flex flex-col gap-6 text-lg leading-relaxed text-foreground/86"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </div>
      </motion.section>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 border-t border-border/20 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          More essays in the archive follow the same pattern: broader visual
          planes, restrained metadata, and room for the ideas to carry the page.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <span>←</span>
          more writing
        </Link>
      </motion.footer>
    </motion.article>
  )
}
