import { Link, createFileRoute } from '@tanstack/react-router'
import { Award } from 'lucide-react'
import { motion } from 'motion/react'

import type { CertificateMeta } from '@/lib/certificates'
import { siteMeta } from '@/config/site-data'
import { getCertificateBySlug, getCertificateIndex } from '@/lib/certificates'

export const Route = createFileRoute('/certificates/$slug')({
  loader: async ({ params }) => {
    const [certificate, certificates] = await Promise.all([
      getCertificateBySlug({ data: { slug: params.slug } }),
      getCertificateIndex(),
    ])

    let prevCert: CertificateMeta | null = null
    let nextCert: CertificateMeta | null = null

    if (certificate) {
      const idx = certificates.findIndex(
        (c: CertificateMeta) => c.slug === params.slug,
      )
      if (idx > 0) prevCert = certificates[idx - 1]
      if (idx < certificates.length - 1) nextCert = certificates[idx + 1]
    }

    return { certificate, prevCert, nextCert }
  },
  head: ({ loaderData }) => {
    if (!loaderData?.certificate) {
      return {
        meta: [{ title: `Certificates | ${siteMeta.defaultTitle}` }],
      }
    }

    const { certificate } = loaderData
    const title = `${certificate.title} | ${siteMeta.defaultTitle}`
    const description = `${certificate.title} — issued by ${certificate.issuer}, ${certificate.issued}`
    const canonicalUrl = `${siteMeta.baseUrl}/certificates/${certificate.slug}`
    const imageUrl = `${siteMeta.baseUrl}/og/certificates/${certificate.slug}`

    return {
      meta: [
        { title },
        { name: 'description', content: description },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:type', content: 'article' },
        { property: 'og:url', content: canonicalUrl },
        { property: 'og:image', content: imageUrl },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:type', content: 'image/svg+xml' },
        { property: 'og:image:alt', content: certificate.title },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
        { name: 'twitter:image:alt', content: certificate.title },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'EducationalOccupationalCredential',
            name: certificate.title,
            description,
            credentialCategory: 'certificate',
            recognizedBy: {
              '@type': 'Organization',
              name: certificate.issuer,
            },
            dateCreated: certificate.issued,
            ...(certificate.expires ? { expires: certificate.expires } : {}),
            ...(certificate.credential_id
              ? { identifier: certificate.credential_id }
              : {}),
            url: certificate.verify_url || canonicalUrl,
            image: certificate.image_url,
            competencyRequired: certificate.skills,
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
                item: `${siteMeta.baseUrl}/certificates`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: certificate.title,
                item: canonicalUrl,
              },
            ],
          }),
        },
      ],
    }
  },
  component: CertificateDetail,
})

function CertificateDetail() {
  const { certificate, prevCert, nextCert } = Route.useLoaderData()

  if (!certificate) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="font-serif text-lg italic text-foreground">
          certificate not found
        </h1>
        <Link
          to="/certificates"
          className="text-xs uppercase tracking-[0.2em] text-primary transition-colors hover:text-primary/80"
        >
          back to certificates
        </Link>
      </section>
    )
  }

  const detailRows = [
    { label: 'issuer', value: certificate.issuer },
    { label: 'issued', value: certificate.issued },
    {
      label: 'expires',
      value: certificate.expires || 'No expiry',
    },
    ...(certificate.credential_id
      ? [{ label: 'credential id', value: certificate.credential_id }]
      : []),
  ]

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
          Credential
        </p>
        <Link
          to="/certificates"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground/70 transition-colors duration-300 hover:text-foreground"
        >
          <span>&larr;</span>
          All certificates
        </Link>
      </motion.div>

      <motion.section variants={item} className="pb-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/40">
              {certificate.issued}
            </span>
            <span className="h-1 w-1 rounded-full bg-foreground/20" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/40">
              {certificate.issuer}
            </span>
            {certificate.expires ? (
              <>
                <span className="h-1 w-1 rounded-full bg-foreground/20" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-foreground/40">
                  Valid through {certificate.expires}
                </span>
              </>
            ) : null}
          </div>

          <h1 className="max-w-3xl font-serif text-3xl leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-5xl xl:text-6xl">
            {certificate.title}
          </h1>

          <p className="max-w-2xl text-base leading-8 text-foreground/70 sm:text-lg">
            Issued by {certificate.issuer}
            {certificate.expires
              ? `, valid through ${certificate.expires}.`
              : '.'}
          </p>
        </div>

        <div className="mt-8 h-px w-full bg-border/10" />
      </motion.section>

      <motion.section
        variants={item}
        className="grid gap-12 lg:grid-cols-[minmax(180px,0.22fr)_minmax(0,0.78fr)]"
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
                  <p className="mt-1 wrap-break-word text-sm leading-6 text-foreground/70">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <a
            href={certificate.verify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-all duration-300 hover:bg-primary hover:shadow-lg hover:shadow-primary/20"
          >
            Verify credential
            <span>↗</span>
          </a>
        </aside>

        <div className="grid gap-12">
          {certificate.image_url ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.8,
                ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
              }}
              className="overflow-hidden rounded-3xl border border-border/10 bg-foreground/2 p-6 sm:p-10"
            >
              <img
                src={certificate.image_url}
                alt={certificate.title}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="h-auto w-full object-contain"
              />
            </motion.div>
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-3xl border border-border/10 bg-foreground/2">
              <Award size={48} className="text-muted-foreground/20" />
            </div>
          )}

          <div className="grid gap-6">
            <div className="grid gap-2">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
                Core Competencies
              </p>
              <p className="max-w-2xl text-sm leading-7 text-foreground/70">
                Skills and domains covered by this credential.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {certificate.skills.length > 0 ? (
                certificate.skills.map((skill: string, index: number) => (
                  <motion.span
                    key={`${skill}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.25, 0.1, 0.25, 1] as [
                        number,
                        number,
                        number,
                        number,
                      ],
                    }}
                    className="rounded-full border border-border/15 bg-foreground/3 px-4 py-2 text-sm font-medium text-foreground/70 transition-colors duration-300 hover:border-primary/30 hover:text-primary"
                  >
                    {skill}
                  </motion.span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground/70">
                  No skills listed for this credential.
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={item}
        className="border-t border-border/10 pt-8"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {prevCert ? (
            <Link
              to="/certificates/$slug"
              params={{ slug: prevCert.slug }}
              className="group flex flex-col gap-2 rounded-2xl p-5 transition-colors duration-300 hover:bg-foreground/3"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                &larr; Previous
              </span>
              <span className="font-serif text-lg leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                {prevCert.title}
              </span>
              <span className="text-xs text-muted-foreground/70">
                {prevCert.issuer}
              </span>
            </Link>
          ) : (
            <div />
          )}

          {nextCert ? (
            <Link
              to="/certificates/$slug"
              params={{ slug: nextCert.slug }}
              className="group flex flex-col gap-2 rounded-2xl p-5 text-right transition-colors duration-300 hover:bg-foreground/3 sm:items-end"
            >
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70">
                Next &rarr;
              </span>
              <span className="font-serif text-lg leading-tight tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
                {nextCert.title}
              </span>
              <span className="text-xs text-muted-foreground/70">
                {nextCert.issuer}
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
          Browse more credentials in the archive.
        </p>
        <Link
          to="/certificates"
          className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-5 py-2.5 text-sm text-muted-foreground/60 transition-all duration-300 hover:bg-foreground/8 hover:text-foreground"
        >
          <span>&larr;</span>
          All certificates
        </Link>
      </motion.footer>
    </motion.article>
  )
}
