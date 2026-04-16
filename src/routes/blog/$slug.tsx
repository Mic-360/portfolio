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
        staggerChildren: 0.12,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] },
    },
  }

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-[1500px] flex-col gap-20 pb-16 md:gap-28"
    >
      <motion.section
        variants={item}
        className="pb-12"
      >
        <div className="flex items-center justify-between gap-4 pb-10">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Essay
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
          >
            <span>←</span>
            Back to blog
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xs text-muted-foreground/50">
            {formatDate(post.date)} · {readingTime} min read
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
            {post.title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground/70">
            {post.summary}
          </p>
        </div>

        <div className="mt-8 h-px w-full bg-border/10" />
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-16 lg:grid-cols-[minmax(200px,0.28fr)_minmax(0,0.72fr)]"
      >
        <aside className="grid content-start gap-8 lg:sticky lg:top-24">
          <div className="grid gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              Details
            </p>
            <div className="grid gap-0">
              {detailRows.map((row) => (
                <div key={row.label} className="border-b border-border/10 py-3 first:pt-0">
                  <p className="text-xs text-muted-foreground/40">
                    {row.label}
                  </p>
                  <p className="mt-1 text-sm text-foreground/70">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {taxonomies.length > 0 ? (
            <div className="grid gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
                Topics
              </p>
              <div className="flex flex-wrap gap-2">
                {taxonomies.map((entry, index) => (
                  <span
                    key={`${entry}-${index}`}
                    className="rounded-full bg-foreground/[0.04] px-3 py-1 text-xs text-muted-foreground/60"
                  >
                    {entry}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </aside>

        <div className="grid min-w-0 gap-0">
          <div
            className="mdx-content min-w-0 flex flex-col gap-6 text-lg leading-relaxed text-foreground/80"
            dangerouslySetInnerHTML={{ __html: post.html }}
          />
        </div>
      </motion.section>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="h-px w-full bg-border/10 sm:hidden" />
        <p className="max-w-2xl text-sm text-muted-foreground/40">
          More writing in the archive.
        </p>
        <Link
          to="/blog"
          className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.05] px-5 py-2.5 text-sm text-muted-foreground/60 transition-all duration-300 hover:bg-foreground/[0.08] hover:text-foreground"
        >
          <span>←</span>
          All posts
        </Link>
      </motion.footer>
    </motion.article>
  )
}
