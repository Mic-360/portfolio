import { motion } from 'motion/react'
import { Link, createFileRoute } from '@tanstack/react-router'
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
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const breadcrumbJsonLd = {
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
        item: `${siteMeta.baseUrl}/resume`,
      },
    ],
  }

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-10"
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <motion.div
        variants={item}
        className="latex-content flex flex-col gap-1 text-foreground leading-relaxed"
        dangerouslySetInnerHTML={{ __html: resume.html }}
      />

      {/* Connect With Me Section */}
      <motion.section
        variants={item}
        className="flex flex-col gap-10 text-center bg-primary/5 p-10 rounded-4xl border-2 border-primary/10 shadow-inner relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-50 pointer-events-none" />
        <div className="relative z-10 flex flex-col gap-4">
          <motion.h2
            variants={item}
            className="text-3xl font-bold tracking-tight"
          >
            Let's Connect!
          </motion.h2>
          <motion.p
            variants={item}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            I'm always open to discussing new projects, creative ideas, or
            opportunities to be part of your visions.
          </motion.p>
          <motion.div
            variants={item}
            className="flex justify-center gap-4 mt-6"
          >
            <button
              data-cal-namespace="connect"
              data-cal-link={siteInfo.calLink}
              data-cal-config='{"layout":"week_view","useSlotsViewOnSmallScreen":"true"}'
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-black text-sm font-bold uppercase tracking-widest hover:scale-105 transition-transform shadow-lg hover:shadow-primary/20 cursor-pointer"
            >
              Get in Touch
              <span className="transform group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
            <a
              href="https://www.linkedin.com/in/bhaumic"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground text-sm font-bold uppercase tracking-widest hover:bg-primary/10 hover:border-primary transition-colors shadow-lg hover:shadow-primary/20"
            >
              LinkedIn
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
                className="w-4 h-4"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
          </motion.div>
        </div>
      </motion.section>

      <motion.div variants={item} className="flex items-center justify-center">
        <a
          href="/Resume-web.pdf"
          download
          className="group flex items-center gap-3 text-lg italic text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download PDF
        </a>
      </motion.div>

      <motion.footer variants={item}>
        <Link
          to="/"
          className="group inline-flex items-center gap-2 italic text-muted-foreground hover:text-primary transition-colors text-md"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          back
        </Link>
      </motion.footer>
    </motion.article>
  )
}
