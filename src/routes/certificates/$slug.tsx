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
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteMeta.baseUrl },
              { '@type': 'ListItem', position: 2, name: 'Certificates', item: `${siteMeta.baseUrl}/certificates` },
              { '@type': 'ListItem', position: 3, name: certificate.title, item: canonicalUrl },
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
        <h1 className="text-lg font-semibold italic">
          certificate not found
        </h1>
        <Link
          to="/"
          className="text-xs uppercase tracking-[0.2em] text-primary hover:text-primary/80"
        >
          back to home
        </Link>
      </section>
    )
  }

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
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.article
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-8"
    >
      {/* Faded banner image */}
      {certificate.image_url && (
        <motion.div
          variants={item}
          className="relative -mx-4 -mt-3.5 h-64 sm:h-96 overflow-hidden rounded-b-sm"
        >
          <img
            src={certificate.image_url}
            alt={certificate.title}
            className="absolute inset-0 w-full h-full object-center opacity-80 scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/60 to-background" />
        </motion.div>
      )}

      <header className="flex flex-col gap-4">
        <motion.div variants={item}>
          <Link
            to="/"
            className="group inline-flex items-center gap-1 italic text-muted-foreground hover:text-primary transition-colors duration-300"
          >
            <span className="transform group-hover:-translate-x-1 transition-transform duration-300">
              &larr;
            </span>
            back to home
          </Link>
        </motion.div>

        <div className="space-y-2">
          <motion.h1
            variants={item}
            className="text-4xl font-black italic tracking-tighter text-foreground uppercase"
          >
            {certificate.title}
          </motion.h1>
          <motion.div
            variants={item}
            className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.3em] font-bold text-primary"
          >
            <span>{certificate.issuer}</span>
            <span className="text-muted-foreground">/</span>
            <span>{certificate.issued}</span>
            {certificate.expires && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">
                  expires {certificate.expires}
                </span>
              </>
            )}
          </motion.div>
        </div>

        {certificate.credential_id && (
          <motion.div variants={item} className="flex flex-col gap-1">
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
              Credential ID
            </span>
            <span className="text-sm font-mono text-foreground/70">
              {certificate.credential_id}
            </span>
          </motion.div>
        )}

        {certificate.skills.length > 0 && (
          <motion.div variants={item} className="flex flex-col gap-2">
            <span className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground font-bold">
              Skills
            </span>
            <div className="flex flex-wrap gap-2">
              {certificate.skills.map((skill) => (
                <span
                  key={skill}
                  className="text-[9px] uppercase tracking-[0.2em] px-3 py-1 rounded-sm border border-primary/30 bg-primary/5 text-primary/80 hover:bg-primary/10 hover:text-primary transition-colors duration-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div variants={item} className="flex flex-wrap gap-6 mt-2">
          <a
            href={certificate.verify_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] uppercase tracking-[0.2em] font-black underline decoration-primary/60 underline-offset-10 hover:text-primary hover:decoration-primary transition-all duration-300 hover:decoration-4"
          >
            verify credential
          </a>
        </motion.div>
      </header>
    </motion.article>
  )
}
