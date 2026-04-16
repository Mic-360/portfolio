import { Link, createFileRoute } from '@tanstack/react-router'
import { motion } from 'motion/react'

import { siteMeta } from '@/config/site-data'
import { getCertificateBySlug } from '@/lib/certificates'

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
            Certificate
          </p>
          <Link
            to="/certificates"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground/50 transition-colors duration-300 hover:text-foreground"
          >
            <span>←</span>
            All certificates
          </Link>
        </div>

        <div className="flex flex-col gap-6">
          <p className="text-xs text-muted-foreground/50">
            {certificate.issued}
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl xl:text-6xl">
            {certificate.title}
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground/70">
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
                  <p className="mt-1 text-sm text-foreground/70 break-words">
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
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-all duration-300 hover:bg-primary"
          >
            Verify credential
            <span>↗</span>
          </a>
        </aside>

        <div className="grid gap-8">
          {certificate.image_url ? (
            <div className="overflow-hidden rounded-3xl bg-foreground/[0.02]">
              <img
                src={certificate.image_url}
                alt={certificate.title}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="h-auto w-full object-contain"
              />
            </div>
          ) : null}

          <div className="grid gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground/50">
              Skills
            </p>
            <p className="max-w-2xl text-sm text-muted-foreground/60">
              Core competencies covered by this credential.
            </p>

            <div className="flex flex-wrap gap-2">
              {certificate.skills.length > 0 ? (
                certificate.skills.map((skill: string, index: number) => (
                  <span
                    key={`${skill}-${index}`}
                    className="rounded-full bg-foreground/[0.04] px-3 py-1.5 text-sm text-foreground/70"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-sm text-muted-foreground/40">
                  No skills listed for this credential.
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.footer
        variants={item}
        className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-2xl text-sm text-muted-foreground/40">
          Browse more credentials in the archive.
        </p>
        <Link
          to="/certificates"
          className="inline-flex items-center gap-2 rounded-full bg-foreground/[0.05] px-5 py-2.5 text-sm text-muted-foreground/60 transition-all duration-300 hover:bg-foreground/[0.08] hover:text-foreground"
        >
          <span>←</span>
          All certificates
        </Link>
      </motion.footer>
    </motion.article>
  )
}
