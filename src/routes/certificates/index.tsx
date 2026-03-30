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
        staggerChildren: 0.08,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
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
        className="relative overflow-hidden border-b border-border/20 pb-12"
      >
        <div className="pointer-events-none absolute inset-x-[18%] top-[8%] h-28 rounded-full bg-primary/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[6%] top-[10%] h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />

        <div className="flex items-center justify-between gap-4 pb-8">
          <div className="flex items-center gap-3">
            <span className="text-primary">
              <Award size={22} />
            </span>
            <span className="text-lg uppercase tracking-[0.28em] text-primary/75">
              credential archive
            </span>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            <span>←</span>
            home
          </Link>
        </div>
        <div className="flex flex-col gap-7 pt-6 lg:pt-10">
          <div className="grid gap-4">
            <h1 className="font-serif text-5xl leading-none text-foreground sm:text-6xl xl:text-7xl">
              Credentials &amp; badge wall.
            </h1>
            <p className="max-w-4xl text-base leading-8 text-foreground/76 sm:text-lg">
              A quieter archive of certifications across platform,
              engineering, cloud, and product work. Each credential shows
              issuer, timing, proof, and core skills without a featured
              certificate taking over the header.
            </p>
          </div>

          <div className="grid gap-5 border-t border-border/25 pt-5 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                credentials logged
              </p>
              <p className="text-2xl font-serif text-foreground">
                {certificates.length.toString().padStart(2, '0')}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                issuers
              </p>
              <p className="text-sm leading-7 text-foreground/76">
                {issuers.length > 0
                  ? issuers.join(' · ')
                  : 'google · coursera · meta · cloud'}
              </p>
            </div>
          </div>
        </div>
      </motion.header>

      <div className="divide-y divide-border/20">
        {certificates.map((certificate: CertificateMeta, index: number) => {
          const reverse = index % 2 === 1

          return (
            <motion.div
              key={certificate.id}
              variants={item}
              className="py-10 first:pt-0 md:py-14"
            >
              <Link
                to="/certificates/$slug"
                params={{ slug: certificate.slug }}
                className="group block"
              >
                <article className="relative min-h-[320px]">
                  <div
                    className={`media-hover-parent absolute inset-y-0 ${
                      reverse
                        ? 'left-0 right-[12%] md:right-[34%]'
                        : 'left-[12%] right-0 md:left-[34%]'
                    }`}
                  >
                    {certificate.image_url ? (
                      <img
                        src={certificate.image_url}
                        alt={certificate.title}
                        referrerPolicy="no-referrer"
                        crossOrigin="anonymous"
                        className="project-ambient-media absolute inset-0 h-full w-full object-contain"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-linear-to-br from-primary/18 via-muted/12 to-transparent" />
                    )}
                    <div
                      className={`absolute inset-0 ${
                        reverse
                          ? 'project-ambient-overlay bg-linear-to-r from-transparent via-background/38 to-background'
                          : 'project-ambient-overlay bg-linear-to-l from-transparent via-background/38 to-background'
                      }`}
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/10 to-transparent" />
                  </div>

                  <div className="relative z-10 grid gap-8 lg:min-h-[320px] lg:grid-cols-12 lg:items-center">
                    <div
                      className={`flex flex-col gap-5 ${
                        reverse
                          ? 'lg:col-start-7 lg:col-span-6 lg:text-right'
                          : 'lg:col-span-6'
                      }`}
                    >
                      <div className="flex items-end gap-4">
                        {!reverse ? (
                          <span className="font-serif text-[3.5rem] leading-none text-foreground/9 sm:text-[5rem]">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        ) : null}
                        <div
                          className={`space-y-3 ${reverse ? 'ml-auto' : ''}`}
                        >
                          <p className="text-[10px] uppercase tracking-[0.26em] text-primary/75">
                            credential
                          </p>
                          <div className="space-y-2">
                            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                              {certificate.issued}
                            </p>
                            <h2 className="font-serif text-3xl leading-tight text-foreground transition-colors group-hover:text-primary sm:text-4xl">
                              {certificate.title}
                            </h2>
                          </div>
                        </div>
                        {reverse ? (
                          <span className="font-serif text-[3.5rem] leading-none text-foreground/9 sm:text-[5rem]">
                            {(index + 1).toString().padStart(2, '0')}
                          </span>
                        ) : null}
                      </div>

                      <p className="max-w-2xl text-base leading-8 text-foreground/76">
                        Issued by {certificate.issuer}
                        {certificate.expires
                          ? ` with validity through ${certificate.expires}.`
                          : ' with no listed expiry.'}
                      </p>

                      <div
                        className={`grid gap-4 border-t border-border/20 pt-4 text-sm leading-7 text-foreground/72 sm:grid-cols-2 ${
                          reverse ? 'lg:text-right' : ''
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            issuer
                          </p>
                          <p>{certificate.issuer}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                            skills
                          </p>
                          <p>
                            {certificate.skills.length > 0
                              ? certificate.skills.slice(0, 4).join(' · ')
                              : 'credential details'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            </motion.div>
          )
        })}
      </div>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 border-t border-border/20 pt-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex gap-6 items-end">
          <img
            src="/frieren/frienbook.svg"
            className="h-16 sm:h-22 inline-block align-bottom"
          />
          <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
            Each credential opens into a clearer detail view with verification,
            data, and the underlying skill list.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <span>←</span>
          back home
        </Link>
      </motion.footer>
    </motion.section>
  )
}
