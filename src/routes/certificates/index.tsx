import { Link, createFileRoute } from '@tanstack/react-router'
import { Award, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useMemo, useState } from 'react'

import type { CertificateMeta } from '@/lib/certificates'
import { siteMeta } from '@/config/site-data'
import { getCertificateIndex } from '@/lib/certificates'
import { PageLayout, PAGE_ITEM_VARIANTS } from '@/layout/layout'

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

  const issuersWithCounts = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of certificates as Array<CertificateMeta>) {
      map.set(c.issuer, (map.get(c.issuer) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  }, [certificates])

  const allSkills = useMemo(() => {
    const set = new Set<string>()
    for (const c of certificates as Array<CertificateMeta>) {
      for (const s of c.skills) set.add(s)
    }
    return set.size
  }, [certificates])

  const filtered = activeIssuer
    ? (certificates as Array<CertificateMeta>).filter(
        (c) => c.issuer === activeIssuer,
      )
    : (certificates as Array<CertificateMeta>)

  // Group filtered certs by issuer for the ledger view
  const groups = useMemo(() => {
    const map = new Map<string, Array<CertificateMeta>>()
    for (const cert of filtered) {
      const existing = map.get(cert.issuer)
      if (existing) existing.push(cert)
      else map.set(cert.issuer, [cert])
    }
    return Array.from(map.entries())
  }, [filtered])

  return (
    <PageLayout>
      {/* ─── Vault masthead ─── */}
      <motion.header variants={PAGE_ITEM_VARIANTS} className="relative">
        <div className="relative overflow-hidden border border-foreground/15 bg-card/30">
          {/* archival paper texture: faint horizontal rules */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(0deg, transparent, transparent 31px, currentColor 31px, currentColor 32px)',
            }}
            aria-hidden
          />
          {/* corner stamps */}
          <span className="instrument-bracket-bl" />
          <span className="instrument-bracket-br" />
          <span
            className="absolute left-0 top-0 h-3 w-3 border-l border-t border-foreground/35"
            aria-hidden
          />
          <span
            className="absolute right-0 top-0 h-3 w-3 border-r border-t border-foreground/35"
            aria-hidden
          />

          {/* classification ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/10 bg-background/40 px-4 py-3 backdrop-blur-sm sm:px-6">
            <div className="flex items-center gap-3 text-[10px] uppercase tracking-[0.32em] text-muted-foreground/65">
              <ShieldCheck size={12} className="text-primary/70" />
              <span className="font-mono">credential vault</span>
              <span className="hidden h-3 w-px bg-foreground/20 sm:inline-block" />
              <span className="hidden font-mono text-muted-foreground/45 sm:inline">
                cleared · public
              </span>
            </div>
            <Link
              to="/"
              className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 transition-colors hover:text-primary"
            >
              ← return ⁄ home
            </Link>
          </div>

          <div className="relative grid gap-10 px-4 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1.4fr_1fr] lg:items-end lg:gap-14">
            <div className="flex flex-col gap-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-primary/70">
                ▸ verified credentials · cloud · cyber
              </p>
              <h1 className="font-serif text-4xl leading-[1.05] tracking-tight text-foreground sm:text-5xl xl:text-6xl">
                A small archive,
                <br />
                <em className="font-serif italic text-primary">stamped</em> and
                signed.
              </h1>
              <p className="max-w-xl text-sm leading-7 text-foreground/70 sm:text-base">
                Certifications earned in cloud, cybersecurity, and platform
                engineering. Each entry includes the issuer, credential ID, and a
                live verification link — the archive is meant to be checked, not
                trusted.
              </p>
            </div>

            {/* ledger-style readout */}
            <div className="grid grid-cols-3 divide-x divide-foreground/10 border-y border-foreground/10 bg-background/45">
              <LedgerCell label="credentials" value={certificates.length} />
              <LedgerCell label="issuers" value={issuersWithCounts.length} />
              <LedgerCell label="skills" value={allSkills} />
            </div>
          </div>
        </div>
      </motion.header>

      {/* ─── Issuer rail ─── */}
      {issuersWithCounts.length > 0 ? (
        <motion.div
          variants={PAGE_ITEM_VARIANTS}
          className="sticky top-0 z-30 -mx-4 border-y border-border/15 bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6"
        >
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide">
            <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/50">
              issued by ::
            </span>
            <div className="flex gap-1.5">
              <IssuerChip
                label="all"
                count={certificates.length}
                active={activeIssuer === null}
                onClick={() => setActiveIssuer(null)}
              />
              {issuersWithCounts.map(([issuer, count]) => (
                <IssuerChip
                  key={issuer}
                  label={issuer}
                  count={count}
                  active={activeIssuer === issuer}
                  onClick={() =>
                    setActiveIssuer(activeIssuer === issuer ? null : issuer)
                  }
                />
              ))}
            </div>
          </div>
        </motion.div>
      ) : null}

      {/* ─── Grouped credential ledger ─── */}
      <div className="flex flex-col gap-14">
        <AnimatePresence mode="popLayout">
          {groups.map(([issuer, certs], gi) => (
            <motion.section
              key={issuer}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
                delay: gi * 0.04,
              }}
              className="flex flex-col gap-6"
            >
              {/* shelf header */}
              <div className="flex items-baseline justify-between gap-4 border-b border-foreground/15 pb-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.32em] text-primary/70">
                    shelf · {(gi + 1).toString().padStart(2, '0')}
                  </span>
                  <h2 className="font-serif text-2xl leading-none tracking-tight text-foreground sm:text-3xl">
                    {issuer}
                  </h2>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55">
                  {certs.length.toString().padStart(2, '0')}{' '}
                  {certs.length === 1 ? 'credential' : 'credentials'}
                </span>
              </div>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {certs.map((cert) => (
                  <CredentialSeal key={cert.id} certificate={cert} />
                ))}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      {/* ─── Footer ─── */}
      <motion.footer
        variants={PAGE_ITEM_VARIANTS}
        className="flex flex-col gap-6 border-t border-foreground/15 pt-8 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="flex items-end gap-6">
          <img
            src="/frieren/frienbook.svg"
            className="inline-block h-16 align-bottom sm:h-22"
            alt=""
            data-backlight="off"
          />
          <div className="space-y-2">
            <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-primary/70">
              ▸ end of ledger
            </p>
            <p className="max-w-md text-sm leading-6 text-muted-foreground/70">
              Every credential opens to a verification view. If something here
              looks wrong, the issuer's link is the source of truth.
            </p>
          </div>
        </div>
        <Link
          to="/"
          className="font-mono text-[10px] uppercase tracking-[0.28em] text-muted-foreground/55 transition-colors hover:text-primary"
        >
          ← return ⁄ home
        </Link>
      </motion.footer>
    </PageLayout>
  )
}

function LedgerCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1 px-4 py-4 sm:px-5 sm:py-5">
      <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/55">
        {label}
      </p>
      <p className="font-serif text-3xl leading-none tracking-tight text-foreground sm:text-4xl">
        {value.toString().padStart(2, '0')}
      </p>
    </div>
  )
}

function IssuerChip({
  label,
  count,
  active,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group/issuer shrink-0 border px-3 py-1.5 transition-all duration-200 ${
        active
          ? 'border-primary bg-primary/15 text-primary'
          : 'border-foreground/15 text-muted-foreground/75 hover:border-foreground/35 hover:text-foreground'
      }`}
    >
      <span className="flex items-baseline gap-2">
        <span className="text-[11px] font-medium tracking-tight">{label}</span>
        <span
          className={`font-mono text-[9px] tracking-[0.18em] ${
            active ? 'text-primary/80' : 'text-muted-foreground/45'
          }`}
        >
          {count.toString().padStart(2, '0')}
        </span>
      </span>
    </button>
  )
}

function CredentialSeal({ certificate }: { certificate: CertificateMeta }) {
  const credentialId = certificate.credential_id ?? ''
  const idDisplay =
    credentialId.length > 18
      ? `${credentialId.slice(0, 8)}…${credentialId.slice(-6)}`
      : credentialId

  return (
    <motion.div
      layout
      layoutId={String(certificate.id)}
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Link
        to="/certificates/$slug"
        params={{ slug: certificate.slug }}
        className="group flex h-full flex-col border border-foreground/12 bg-card/30 p-5 transition-all duration-300 hover:border-primary/45 hover:bg-card/60 sm:p-6"
      >
        {/* The seal */}
        <div className="flex items-start justify-between gap-3">
          <div className="relative">
            <div
              className="absolute inset-0 -m-1 rounded-full border border-dashed border-primary/30 transition-all duration-500 group-hover:rotate-180 group-hover:border-primary/60"
              aria-hidden
            />
            <div className="relative h-16 w-16 overflow-hidden rounded-full border border-foreground/15 bg-foreground/5">
              {certificate.image_url ? (
                <img
                  src={certificate.image_url}
                  alt=""
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  className="h-full w-full object-cover"
                  loading="lazy"
                  data-backlight="off"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Award size={20} className="text-muted-foreground/40" />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/50">
              issued
            </span>
            <span className="font-serif text-sm tracking-tight text-foreground/85">
              {certificate.issued}
            </span>
          </div>
        </div>

        {/* Body */}
        <h3 className="mt-5 font-serif text-lg leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
          {certificate.title}
        </h3>

        {certificate.skills.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1">
            {certificate.skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="border border-foreground/12 bg-foreground/3 px-2 py-0.5 text-[10px] font-medium tracking-tight text-muted-foreground/80"
              >
                {skill}
              </span>
            ))}
            {certificate.skills.length > 4 ? (
              <span className="px-2 py-0.5 text-[10px] text-muted-foreground/50">
                +{certificate.skills.length - 4}
              </span>
            ) : null}
          </div>
        ) : null}

        {/* Footer rule */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-foreground/10 pt-3">
          <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground/50">
            {idDisplay ? `id ${idDisplay}` : 'no id'}
          </span>
          <span className="flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.22em] text-primary/80 transition-transform duration-300 group-hover:translate-x-1">
            verify
            <span className="text-[11px]">↗</span>
          </span>
        </div>
      </Link>
    </motion.div>
  )
}
