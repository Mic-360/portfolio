import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import { CometCard } from '@/components/ui/comet-card'
import { siteInfo, siteMeta } from '@/config/site-data'
import { getResume } from '@/lib/content'

export const Route = createFileRoute('/resume')({
  loader: async () => ({
    resume: await getResume(),
  }),
  head: ({ loaderData }) => {
    const title = `Resume | ${siteMeta.defaultTitle}`
    const description =
      loaderData?.resume?.summary ||
      'Professional resume of Bhaumik Singh — Full Stack Software Engineer.'
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`
    const canonicalUrl = `${siteMeta.baseUrl}/resume`

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
        { property: 'og:image:type', content: 'image/png' },
        { property: 'og:image:alt', content: title },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: title },
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
                name: 'Resume',
                item: canonicalUrl,
              },
            ],
          }),
        },
      ],
    }
  },
  component: ResumePage,
})

function ResumePage() {
  const { resume } = Route.useLoaderData()

  if (!resume) {
    return (
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col gap-4"
      >
        <h1 className="text-2xl font-semibold italic">Resume not found</h1>
      </motion.section>
    )
  }

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
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.25, 0.1, 0.25, 1] as const },
    },
  }

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-16 max-w-4xl mx-auto w-full"
    >
      <motion.div
        variants={item}
        className="latex-content flex flex-col gap-1 text-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: resume.html }}
      />

      <motion.div variants={item} className="mx-4 sm:mx-6">
        <CometCard rotateDepth={10} translateDepth={12}>
          <section className="relative flex flex-col gap-8 overflow-hidden rounded-3xl bg-primary/3 p-10 text-center sm:p-14">
            <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-primary/4 via-transparent to-transparent" />
            <div className="relative z-10 flex flex-col gap-5">
              <motion.h2
                variants={item}
                className="font-serif text-3xl tracking-tight sm:text-4xl"
              >
                Let's Connect
              </motion.h2>
              <motion.p
                variants={item}
                className="mx-auto max-w-2xl text-base leading-8 text-foreground/70"
              >
                I'm always open to discussing new projects, creative ideas, or
                opportunities to be part of your visions.
              </motion.p>
              <motion.div
                variants={item}
                className="mt-4 flex flex-wrap justify-center gap-4"
              >
                <button
                  data-cal-namespace="connect"
                  data-cal-link={siteInfo.calLink}
                  data-cal-config='{"layout":"week_view","useSlotsViewOnSmallScreen":"true"}'
                  className="group inline-flex cursor-pointer items-center gap-2 rounded-full bg-foreground px-7 py-3 text-sm font-medium text-background transition-all duration-300 hover:bg-primary"
                >
                  Get in Touch
                  <span className="transform transition-transform duration-300 group-hover:translate-x-0.5">
                    →
                  </span>
                </button>
                <a
                  href="/resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 rounded-full border border-border/30 px-7 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:border-primary/50 hover:text-primary"
                >
                  Download PDF
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </motion.div>
            </div>
          </section>
        </CometCard>
      </motion.div>

      <motion.footer variants={item}>
        <Link
          to="/"
          className="group inline-flex items-center gap-2 text-xs text-muted-foreground/70 hover:text-primary transition-colors duration-300 px-4 sm:px-6"
        >
          <span className="transform group-hover:-translate-x-0.5 transition-transform duration-300">
            ←
          </span>
          back
        </Link>
      </motion.footer>
    </motion.article>
  )
}
