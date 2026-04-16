import { Link, createFileRoute } from '@tanstack/react-router'
import { Award } from 'lucide-react'
import { motion } from 'motion/react'

import type { CertificateMeta } from '@/lib/certificates'
import { siteMeta } from '@/config/site-data'
import { getCertificateIndex } from '@/lib/certificates'

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
              itemListElement: certificates.map((cert: CertificateMeta, index: number) => ({
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
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: siteMeta.baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Certificates',
                item: canonicalUrl,
              },
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
  const issuers = Array.from(
    new Set(certificates.map((certificate: CertificateMeta) => certificate.issuer)),
  ).slice(0, 4)

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
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-14"
    >
      <motion.header
        variants={item}
        className="pb-12"
      >
        <div className="flex items-center justify-between gap-4 pb-10">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/50">
              <Award size={14} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/60">
              Certificates
            </span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
          >
            <span>←</span>
            Home
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            Credentials &amp; Certificates
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground/70">
            Professional certifications across platform engineering, cloud,
            and product work.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-8 text-sm text-muted-foreground/50">
          <span>{certificates.length} credentials</span>
          <span className="h-px flex-1 bg-border/10" />
          <span>
            {issuers.length > 0
              ? issuers.join(' · ')
              : 'Various issuers'}
          </span>
        </div>
      </motion.header>

      <div className="grid gap-4">
        {certificates.map((certificate: CertificateMeta, index: number) => (
          <motion.div
            key={certificate.id}
            variants={item}
          >
            <Link
              to="/certificates/$slug"
              params={{ slug: certificate.slug }}
              className="group block"
            >
              <article className="grid gap-6 rounded-2xl border border-border/10 bg-foreground/[0.01] p-6 transition-all duration-300 hover:border-border/20 hover:bg-foreground/[0.03] sm:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] sm:items-center">
                {certificate.image_url ? (
                  <div className="overflow-hidden rounded-xl bg-foreground/[0.02]">
                    <img
                      src={certificate.image_url}
                      alt={certificate.title}
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="h-48 w-full object-contain transition-transform duration-500 group-hover:scale-[1.02] sm:h-40"
                    />
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-xl bg-foreground/[0.03]">
                    <Award size={24} className="text-muted-foreground/30" />
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground/40">
                      {certificate.issued}
                    </span>
                    <span className="text-xs text-muted-foreground/30">·</span>
                    <span className="text-xs text-muted-foreground/40">
                      {certificate.issuer}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                    {certificate.title}
                  </h2>
                  {certificate.skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {certificate.skills.slice(0, 4).map((skill: string) => (
                        <span
                          key={skill}
                          className="rounded-full bg-foreground/[0.04] px-2.5 py-0.5 text-[11px] text-muted-foreground/50"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            </Link>
          </motion.div>
        ))}
      </div>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-end gap-6">
          <img
            src="/frieren/frienbook.svg"
            className="h-16 inline-block align-bottom opacity-30 sm:h-22"
          />
          <p className="max-w-2xl text-sm text-muted-foreground/40">
            Each credential opens into a detail view with verification and skills.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.05] px-5 py-2.5 text-sm text-muted-foreground/60 transition-all duration-300 hover:bg-foreground/[0.08] hover:text-foreground"
        >
          <span>←</span>
          Home
        </Link>
      </motion.footer>
    </motion.section>
  )
}
