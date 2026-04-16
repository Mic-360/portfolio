import { Link, createFileRoute } from '@tanstack/react-router'
import { Award } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'

import { siteMeta } from '@/config/site-data'
import type { CertificateMeta } from '@/lib/certificates'
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
              itemListElement: certificates.map(
                (cert: CertificateMeta, index: number) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  url: `${siteMeta.baseUrl}/certificates/${cert.slug}`,
                  name: cert.title,
                  description: `${cert.title} — issued by ${cert.issuer}`,
                }),
              ),
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
  const [activeIssuer, setActiveIssuer] = useState<string | null>(null)

  const allIssuers = Array.from(
    new Set(certificates.map((cert: CertificateMeta) => cert.issuer)),
  )

  const filteredCertificates = activeIssuer
    ? certificates.filter((c: CertificateMeta) => c.issuer === activeIssuer)
    : certificates

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 28 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
      },
    },
  }

  return (
    <motion.section
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-16"
    >
      {/* Header */}
      <motion.header variants={item} className="relative overflow-hidden pb-8">
        <div className="pointer-events-none absolute inset-x-[18%] top-[8%] h-28 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] top-[10%] h-72 w-72 rounded-full bg-primary/6 blur-[120px]" />

        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="text-primary/50">
              <Award size={18} />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              credentials
            </span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
          >
            <span>&larr;</span>
            home
          </Link>
        </div>

        <div className="flex flex-col gap-8 pt-8 lg:pt-12">
          <div className="grid gap-5">
            <h1 className="font-serif text-4xl leading-[1.08] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
              Every credential, verified.
            </h1>
            <p className="max-w-2xl text-base leading-8 text-foreground/50 sm:text-lg">
              Professional certifications across platform engineering, cloud
              infrastructure, and product development.
            </p>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                credentials earned
              </p>
              <p className="font-serif text-2xl text-foreground">
                {certificates.length.toString().padStart(2, '0')}
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/40">
                issuers
              </p>
              <p className="font-serif text-2xl text-foreground">
                {allIssuers.length.toString().padStart(2, '0')}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Issuer filter bar */}
      {allIssuers.length > 0 ? (
        <motion.div
          variants={item}
          className="sticky top-0 z-30 -mx-4 border-b border-border/10 bg-background/80 px-4 py-3 backdrop-blur-xl"
        >
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              type="button"
              onClick={() => setActiveIssuer(null)}
              className={`filter-pill ${
                activeIssuer === null
                  ? 'filter-pill-active'
                  : 'filter-pill-inactive'
              }`}
            >
              All
            </button>
            {allIssuers.map((issuer) => (
              <button
                key={issuer}
                type="button"
                onClick={() =>
                  setActiveIssuer(activeIssuer === issuer ? null : issuer)
                }
                className={`filter-pill ${
                  activeIssuer === issuer
                    ? 'filter-pill-active'
                    : 'filter-pill-inactive'
                }`}
              >
                {issuer}
              </button>
            ))}
          </div>
        </motion.div>
      ) : null}

      {/* Certificates grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredCertificates.map(
            (certificate: CertificateMeta, index: number) => {
              const isHero = index === 0

              return (
                <motion.div
                  key={certificate.id}
                  layout
                  layoutId={String(certificate.id)}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1],
                    layout: { duration: 0.4 },
                  }}
                  className={isHero ? 'sm:col-span-2 lg:col-span-2' : ''}
                >
                  <Link
                    to="/certificates/$slug"
                    params={{ slug: certificate.slug }}
                    className="group block h-full"
                  >
                    <motion.article
                      whileHover={{ y: -4 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                      }}
                      className={`project-card-apple flex h-full flex-col overflow-hidden rounded-2xl border border-border/10 bg-card/50 ${
                        isHero ? 'sm:flex-row' : ''
                      }`}
                    >
                      {/* Image area */}
                      <div
                        className={`media-hover-parent relative overflow-hidden bg-foreground/[0.02] ${
                          isHero
                            ? 'aspect-[4/3] sm:aspect-auto sm:w-[45%]'
                            : 'aspect-[16/10]'
                        }`}
                      >
                        {certificate.image_url ? (
                          <img
                            src={certificate.image_url}
                            alt={certificate.title}
                            referrerPolicy="no-referrer"
                            crossOrigin="anonymous"
                            className="media-hover-image absolute inset-0 h-full w-full object-contain p-4"
                            loading="lazy"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Award
                              size={32}
                              className="text-muted-foreground/20"
                            />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-card/40 via-transparent to-transparent" />
                      </div>

                      {/* Info section */}
                      <div
                        className={`flex flex-1 flex-col justify-between gap-4 p-5 sm:p-6 ${
                          isHero ? 'sm:py-8' : ''
                        }`}
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] uppercase tracking-[0.2em] text-primary/50">
                              {certificate.issuer}
                            </span>
                            <span className="h-px flex-1 bg-border/10" />
                            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/35">
                              {certificate.issued}
                            </span>
                          </div>

                          <h2
                            className={`font-serif leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary ${
                              isHero
                                ? 'text-xl sm:text-2xl lg:text-3xl'
                                : 'text-lg'
                            }`}
                          >
                            {certificate.title}
                          </h2>

                          {certificate.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {certificate.skills
                                .slice(0, isHero ? 6 : 3)
                                .map((skill: string) => (
                                  <span
                                    key={skill}
                                    className="rounded-full border border-border/15 bg-foreground/[0.03] px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground/55"
                                  >
                                    {skill}
                                  </span>
                                ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="flex items-center justify-between gap-4 border-t border-border/8 pt-3">
                          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/30">
                            {certificate.credential_id
                              ? `ID: ${certificate.credential_id.slice(0, 16)}${certificate.credential_id.length > 16 ? '...' : ''}`
                              : 'View credential'}
                          </span>
                          <span className="text-xs text-primary/50 transition-transform duration-300 group-hover:translate-x-1">
                            &rarr;
                          </span>
                        </div>
                      </div>
                    </motion.article>
                  </Link>
                </motion.div>
              )
            },
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        variants={item}
        className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-end gap-6">
          <img
            src="/frieren/frienbook.svg"
            className="inline-block h-16 align-bottom sm:h-22"
            alt=""
            data-backlight="off"
          />
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground/40">
            Each credential opens into a verification view with skills breakdown
            and issuer details.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs text-muted-foreground/40 transition-colors duration-300 hover:text-primary"
        >
          <span>&larr;</span>
          back home
        </Link>
      </motion.footer>
    </motion.section>
  )
}
