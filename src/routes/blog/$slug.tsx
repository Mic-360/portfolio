import { Link, createFileRoute } from '@tanstack/react-router'
import { motion, useScroll, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import type { BlogMeta } from '@/lib/content'
import { siteMeta } from '@/config/site-data'
import { getBlogIndex, getBlogPostBySlug } from '@/lib/content'
import { formatDate } from '@/lib/format'

export const Route = createFileRoute('/blog/$slug')({
  loader: async ({ params }) => {
    const [post, posts] = await Promise.all([
      getBlogPostBySlug({ data: { slug: params.slug } }),
      getBlogIndex(),
    ])

    let prevPost: BlogMeta | null = null
    let nextPost: BlogMeta | null = null

    if (post) {
      const idx = posts.findIndex((p) => p.slug === params.slug)
      if (idx > 0) prevPost = posts[idx - 1]
      if (idx < posts.length - 1) nextPost = posts[idx + 1]
    }

    return { post, prevPost, nextPost }
  },
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

function ReadingProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return <motion.div className="reading-progress" style={{ scaleX }} />
}

type TocHeading = { id: string; text: string; level: number }

function TableOfContents() {
  const [headings, setHeadings] = useState<Array<TocHeading>>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const container = document.querySelector('.mdx-content')
    if (!container) return

    const elements = container.querySelectorAll('h2[id], h3[id]')
    const items: Array<TocHeading> = []
    elements.forEach((el) => {
      items.push({
        id: el.id,
        text: el.textContent || '',
        level: el.tagName === 'H2' ? 2 : 3,
      })
    })
    setHeadings(items)
  }, [])

  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) {
          setActiveId(visible[0].target.id)
        }
      },
      { rootMargin: '-80px 0px -70% 0px' },
    )

    headings.forEach((h) => {
      const el = document.getElementById(h.id)
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [headings])

  if (headings.length === 0) return null

  return (
    <nav className="flex flex-col gap-0.5">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
        On this page
      </p>
      {headings.map((h) => (
        <a
          key={h.id}
          href={`#${h.id}`}
          onClick={(e) => {
            e.preventDefault()
            document
              .getElementById(h.id)
              ?.scrollIntoView({ behavior: 'smooth' })
          }}
          className={`toc-link ${h.level === 3 ? 'toc-h3' : ''} ${
            activeId === h.id ? 'active' : ''
          }`}
        >
          {h.text}
        </a>
      ))}
    </nav>
  )
}

function BlogPost() {
  const { post, prevPost, nextPost } = Route.useLoaderData()

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
    { label: 'published', value: formatDate(post.date) },
    { label: 'reading time', value: `${readingTime} min read` },
    {
      label: 'section',
      value:
        post.categories.length > 0
          ? post.categories.join(' \u00b7 ')
          : 'writing',
    },
    {
      label: 'topics',
      value: post.tags.length > 0 ? post.tags.join(' \u00b7 ') : 'build notes',
    },
  ]
  const taxonomies = [...post.categories, ...post.tags]

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <>
      <ReadingProgress />

      <motion.article
        variants={container}
        initial="hidden"
        animate="show"
        className="mx-auto flex w-full max-w-375 flex-col gap-16 pb-16 md:gap-24"
      >
        <motion.div
          variants={item}
          className="flex items-center justify-between gap-4"
        >
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
            Essay
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground/70 transition-colors duration-300 hover:text-foreground"
          >
            <span>&larr;</span>
            Back to blog
          </Link>
        </motion.div>

        <motion.section variants={item} className="pb-4">
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                {formatDate(post.date)}
              </span>
              <span className="h-1 w-1 rounded-full bg-foreground/20" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                {readingTime} min read
              </span>
            </div>

            <h1 className="max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
              {post.title}
            </h1>

            <p className="max-w-2xl text-base leading-8 text-foreground/70 sm:text-lg">
              {post.summary}
            </p>

            {taxonomies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {taxonomies.map((entry, index) => (
                  <span
                    key={`${entry}-${index}`}
                    className="rounded-full border border-border/15 bg-foreground/3 px-3 py-1 text-[11px] font-medium text-muted-foreground/70"
                  >
                    {entry}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="mt-8 h-px w-full bg-border/10" />
        </motion.section>

        <motion.section
          variants={item}
          className="grid gap-12 lg:grid-cols-[minmax(180px,0.22fr)_minmax(0,0.78fr)] xl:grid-cols-[minmax(180px,0.20fr)_minmax(0,0.56fr)_minmax(140px,0.20fr)]"
        >
          <aside className="grid content-start gap-8 lg:sticky lg:top-24 lg:self-start">
            <div className="grid gap-4">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
                Details
              </p>
              <div className="grid gap-0">
                {detailRows.map((row) => (
                  <div
                    key={row.label}
                    className="border-b border-border/10 py-3 first:pt-0"
                  >
                    <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
                      {row.label}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-foreground/70">
                      {row.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <div className="min-w-0">
            <div
              className="mdx-content flex flex-col gap-6 text-base leading-relaxed text-foreground/80 sm:text-lg"
              dangerouslySetInnerHTML={{ __html: post.html }}
            />
          </div>

          <div className="hidden xl:block">
            <div className="sticky top-24 self-start">
              <TableOfContents />
            </div>
          </div>
        </motion.section>

        <motion.section
          variants={item}
          className="border-t border-border/10 pt-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {prevPost ? (
              <Link
                to="/blog/$slug"
                params={{ slug: prevPost.slug }}
                className="group flex flex-col gap-2 rounded-2xl p-5 transition-colors duration-300 hover:bg-foreground/3"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  &larr; Previous
                </span>
                <span className="font-serif text-lg leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {prevPost.title}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  {formatDate(prevPost.date)}
                </span>
              </Link>
            ) : (
              <div />
            )}

            {nextPost ? (
              <Link
                to="/blog/$slug"
                params={{ slug: nextPost.slug }}
                className="group flex flex-col gap-2 rounded-2xl p-5 text-right transition-colors duration-300 hover:bg-foreground/3 sm:items-end"
              >
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Next &rarr;
                </span>
                <span className="font-serif text-lg leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                  {nextPost.title}
                </span>
                <span className="text-xs text-muted-foreground/70">
                  {formatDate(nextPost.date)}
                </span>
              </Link>
            ) : null}
          </div>
        </motion.section>

        <motion.footer
          variants={item}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p className="max-w-2xl text-sm text-muted-foreground/70">
            More writing in the archive.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-5 py-2.5 text-sm text-muted-foreground/60 transition-all duration-300 hover:bg-foreground/8 hover:text-foreground"
          >
            <span>&larr;</span>
            All posts
          </Link>
        </motion.footer>
      </motion.article>
    </>
  )
}
