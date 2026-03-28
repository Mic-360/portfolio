import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'
import type { CertificateMeta } from '@/lib/content'
import { siteMeta } from '@/config/site-data'
import { getCertificateIndex } from '@/lib/content'
import { Award } from 'lucide-react'

export const Route = createFileRoute('/certificates/')({
  loader: async () => ({
    certificates: await getCertificateIndex(),
  }),
  head: ({ loaderData }) => {
    const title = `Certificates | ${siteMeta.defaultTitle}`
    const description = 'Professional certifications and credentials'
    const canonicalUrl = `${siteMeta.baseUrl}/certificates`
    const certificates = loaderData?.certificates ?? []

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: canonicalUrl },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'Certificates',
            description,
            url: canonicalUrl,
            mainEntity: {
              '@type': 'ItemList',
              itemListElement: certificates.map((cert, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${siteMeta.baseUrl}/certificates/${cert.slug}`,
                name: cert.title,
                description: `${cert.title} — issued by ${cert.issuer}`,
              })),
            },
          }),
        },
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteMeta.baseUrl },
              { '@type': 'ListItem', position: 2, name: 'Certificates', item: canonicalUrl },
            ],
          }),
        },
      ],
    }
  },
  component: CertificatesIndex,
})

function CertificatesIndex() {
  const { certificates } = Route.useLoaderData()

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent italic">
              <Award size={24} className="inline-block mr-2 text-primary" />
              certificates
            </h1>
            <div className="h-0.5 w-12 bg-primary rounded-full" />
          </div>
          <Link
            to="/"
            className="animus-corner group px-4 py-1 inline-flex items-center gap-2 italic text-muted-foreground hover:text-primary transition-all duration-500"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              ←
            </span>
            back
          </Link>
        </div>
        <div className="flex flex-row-reverse gap-4 items-center justify-between">
          <img
            src="/frieren/frienbook.svg"
            className="h-16 sm:h-22 inline-block align-bottom"
          />
          <p className="text-muted-foreground leading-relaxed">
            {certificates.length} professional certifications and credentials across platform like google, meta, coursera, etc.
          </p>
        </div>
      </header>

      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
      >
        {certificates.map((cert: CertificateMeta) => (
          <Link
            key={cert.id}
            to="/certificates/$slug"
            params={{ slug: cert.slug }}
            className="group animus-corner relative flex flex-col gap-2 p-4 border border-border/20 bg-card/10 hover:border-primary/50 transition-all duration-500 overflow-hidden h-64"
          >
            {cert.image_url && (
              <>
                <img
                  src={cert.image_url}
                  alt={cert.title}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="absolute inset-0 w-full h-full object-center opacity-80 group-hover:opacity-90 transition-opacity duration-700 scale-110"
                />
                <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/50 to-transparent" />
              </>
            )}
            <div className="z-10 flex flex-col gap-1.5 absolute bottom-1">
              <span className="text-[9px] text-primary/80 font-mono uppercase tracking-[0.2em]">
                {cert.issuer}
              </span>
              <h3 className="text-sm font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
                {cert.title}
              </h3>
              <span className="text-[9px] text-muted-foreground font-mono">
                {cert.issued}
              </span>
              {cert.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {cert.skills.slice(0, 3).map((skill) => (
                    <span
                      key={skill}
                      className="text-[8px] px-1.5 py-0.5 rounded-xs bg-primary/5 text-primary/70 border border-primary/20 font-mono tracking-tighter"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Link>
        ))}
      </motion.div>
    </motion.div>
  )
}
