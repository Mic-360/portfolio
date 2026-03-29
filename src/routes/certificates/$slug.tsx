import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

import { siteMeta } from '@/config/site-data'
import { getCertificateBySlug } from '@/lib/content'

export const Route = createFileRoute('/certificates/$slug')({
  loader: async ({ params }) => ({
    certificate: await getCertificateBySlug({ data: { slug: params.slug } }),
  }),
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
            ...(certificate.expires
              ? { expires: certificate.expires }
              : {}),
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
  const { certificate } = Route.useLoaderData()

  if (!certificate) {
    return (
      <section className="flex flex-col gap-4">
        <h1 className="font-serif text-3xl text-foreground">
          certificate not found
        </h1>
        <Link
          to="/"
          className="text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          ← back to home
        </Link>
      </section>
    )
  }

  const detailRows = [
    {
      label: 'issuer',
      value: certificate.issuer,
    },
    {
      label: 'issued',
      value: certificate.issued,
    },
    {
      label: 'expires',
      value: certificate.expires || 'No listed expiry',
    },
    ...(certificate.credential_id
      ? [
          {
            label: 'credential id',
            value: certificate.credential_id,
          },
        ]
      : []),
  ]

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
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45 } },
  }

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto flex w-full max-w-6xl flex-col gap-14 pb-16"
    >
      <motion.section
        variants={item}
        className="relative overflow-hidden border-b border-border/20 pb-12"
      >
        <div className="pointer-events-none absolute inset-x-[16%] top-[10%] h-28 rounded-full bg-primary/14 blur-3xl" />
        <div className="pointer-events-none absolute right-[8%] top-[12%] h-72 w-72 rounded-full bg-primary/8 blur-[120px]" />

        <div className="flex flex-col gap-7 pt-6 lg:pt-10">
          <div className="flex items-center justify-between gap-4">
            <p className="text-lg uppercase tracking-[0.28em] text-primary/75">
              credential dossier
            </p>
            <Link
              to="/certificates"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <span>←</span>
              archive
            </Link>
          </div>

          <div className="grid gap-4">
            <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
              {certificate.issued}
            </p>
            <h1 className="font-serif text-5xl leading-none text-foreground sm:text-6xl xl:text-7xl">
              {certificate.title}
            </h1>
            <p className="max-w-4xl text-base leading-8 text-foreground/76 sm:text-lg">
              Issued by {certificate.issuer}
              {certificate.expires
                ? ` and currently valid through ${certificate.expires}.`
                : '.'}
            </p>
          </div>

          <div className="grid gap-5 border-t border-border/25 pt-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                record type
              </p>
              <p className="text-sm leading-7 text-foreground/76">
                Verified credential with issuer, timeline, and skills.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">
                proof
              </p>
              <p className="text-sm leading-7 text-foreground/76">
                Public verification link and issuer metadata are kept alongside
                the credential details below.
              </p>
            </div>
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
                credential rail
              </p>
              <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
            </div>

            <div className="divide-y divide-border/20">
              {detailRows.map((row) => (
                <div key={row.label} className="py-3 first:pt-0">
                  <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {row.label}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground/76 break-words">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5">
            <div className="flex items-center gap-4">
              <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
                verification
              </p>
              <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
            </div>

            <a
              href={certificate.verify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-between gap-4 border-b border-border/20 py-3 text-sm leading-7 text-foreground/76 transition-colors hover:text-primary"
            >
              <span>Verify credential</span>
              <span className="text-muted-foreground">↗</span>
            </a>
          </div>
        </aside>

        <div className="grid gap-6">
          {certificate.image_url ? (
            <div className="relative min-h-[280px] border-b border-border/20 pb-6">
              <img
                src={certificate.image_url}
                alt={certificate.title}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="hero-blend-media media-hover-image media-hover-fade h-full w-full object-contain"
              />
              <div className="hero-grid-overlay absolute inset-0" />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between gap-4 text-[10px] uppercase tracking-[0.28em] text-foreground/48">
                <span>{certificate.issuer}</span>
                <span>credential image</span>
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-4">
            <p className="shrink-0 text-[10px] uppercase tracking-[0.26em] text-primary/75">
              competency
            </p>
            <div className="h-px flex-1 bg-linear-to-r from-primary/30 to-transparent" />
          </div>

          <div className="grid gap-5 border-t border-border/20 pt-5">
            <p className="max-w-2xl text-base leading-8 text-foreground/76">
              The credential maps to the following skill areas and serves as a
              public record of training, assessment, or completion.
            </p>

            <div className="divide-y divide-border/20">
              {certificate.skills.length > 0 ? (
                certificate.skills.map((skill, index) => (
                  <div
                    key={`${skill}-${index}`}
                    className="py-3 text-sm leading-7 text-foreground/76"
                  >
                    {skill}
                  </div>
                ))
              ) : (
                <div className="py-3 text-sm leading-7 text-muted-foreground">
                  No skills listed for this credential.
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 border-t border-border/20 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
          More credentials in the archive with calmer visual
          planes, straightforward facts, and clear verification.
        </p>
        <Link
          to="/certificates"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <span>←</span>
          back to certificates
        </Link>
      </motion.footer>
    </motion.article>
  )
}
