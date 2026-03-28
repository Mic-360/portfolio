import { Link, createFileRoute } from '@tanstack/react-router'
import type { ImgHTMLAttributes } from 'react'
import { siteImages, siteMeta } from '@/config/site-data'

export const Route = createFileRoute('/readme')({
  head: () => {
    const title = `README | ${siteMeta.defaultTitle}`
    const description =
      'GitHub profile, stats, languages, tools, and technical overview of Bhaumic Singh.'
    const imageUrl = `${siteMeta.baseUrl}${siteMeta.defaultImage}`
    const canonicalUrl = `${siteMeta.baseUrl}/readme`

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
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
      ],
      links: [{ rel: 'canonical', href: canonicalUrl }],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: siteMeta.baseUrl },
              { '@type': 'ListItem', position: 2, name: 'README', item: canonicalUrl },
            ],
          }),
        },
      ],
    }
  },
  component: ReadmePage,
})

type ReadmeImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  width: number
  height: number
}

function ReadmeImage({
  width,
  height,
  loading = 'eager',
  decoding = 'async',
  className,
  ...props
}: ReadmeImageProps) {
  return (
    <img
      width={width}
      height={height}
      loading={loading}
      decoding={decoding}
      className={className}
      {...props}
    />
  )
}

function ReadmePage() {
  return (
    <article className="flex flex-col gap-12 max-w-5xl mx-auto w-full">
      {/* Profile Image and GitHub Stats Section */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-10">
        <div className="w-40 h-40 shrink-0 relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <ReadmeImage
            src={siteImages.profilePhoto}
            alt="Bhaumic Singh — Profile Photo"
            width={160}
            height={160}
            className="w-full h-full rounded-full border-2 border-primary shadow-2xl relative z-10 object-cover"
          />
        </div>
        <div className="w-full flex-1">
          <ReadmeImage
            src="https://github-profile-summary-cards.vercel.app/api/cards/profile-details?username=mic-360&theme=transparent"
            alt="Stats"
            width={495}
            height={195}
            className="w-full h-auto filter drop-shadow-md"
          />
        </div>
      </section>

      {/* Summary Cards Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          'repos-per-language',
          'most-commit-language',
          'stats',
          'productive-time?utcOffset=5.30',
        ].map((type) => (
          <div
            key={type}
            className="bg-card/20 shadow-2xl overflow-hidden border border-border/50 hover:border-primary/30 transition-colors"
          >
            <ReadmeImage
              src={`https://github-profile-summary-cards.vercel.app/api/cards/${type.includes('?') ? type + '&' : type + '?'}username=mic-360&theme=transparent`}
              alt={type}
              width={495}
              height={195}
              className="w-full h-auto"
            />
          </div>
        ))}
      </section>

      {/* Metrics Section */}
      <section className="w-full shadow-2xl overflow-hidden border border-border/50 bg-card/20 p-2">
        <ReadmeImage
          src="https://raw.githubusercontent.com/Mic-360/Mic-360/main/github-metrics.svg"
          alt="Contributions Metrics"
          width={1200}
          height={480}
          className="w-full h-auto rounded-lg"
        />
      </section>

      {/* Languages and Tools Section */}
      <section className="flex flex-col gap-8 text-center py-8 relative">
        <div className="absolute inset-0 m-auto w-60 h-60 lg:w-80 lg:h-80 bg-primary/40 rounded-full blur-[100px] pointer-events-none z-0 animate-[float_10s_ease-in-out_infinite]" />
        <h2 className="text-2xl font-black italic uppercase tracking-tighter relative z-10">
          <span className="text-primary mr-2">/</span>
          Languages and Tools
        </h2>
        <div className="flex flex-wrap justify-center gap-6 md:gap-8 relative z-10">
          {[
            { src: 'nextjs/nextjs-original.svg', alt: 'Next.js' },
            { src: 'react/react-original.svg', alt: 'React' },
            { src: 'nodejs/nodejs-original.svg', alt: 'Node.js' },
            { src: 'bun/bun-original.svg', alt: 'Bun' },
            { src: 'git/git-original.svg', alt: 'Git' },
            {
              src: 'amazonwebservices/amazonwebservices-plain-wordmark.svg',
              alt: 'AWS',
            },
            { src: 'cloudflare/cloudflare-original.svg', alt: 'Cloudflare' },
            { src: 'typescript/typescript-original.svg', alt: 'TypeScript' },
            { src: 'android/android-plain.svg', alt: 'Android' },
            { src: 'cplusplus/cplusplus-original.svg', alt: 'C++' },
            { src: 'flutter/flutter-original.svg', alt: 'Flutter' },
            {
              src: 'googlecloud/googlecloud-original.svg',
              alt: 'Google Cloud',
            },
            { src: 'python/python-original.svg', alt: 'Python' },
            { src: 'ubuntu/ubuntu-original.svg', alt: 'Ubuntu' },
            { src: 'java/java-original.svg', alt: 'Java' },
            { src: 'csharp/csharp-original.svg', alt: 'C#' },
            { src: 'gitlab/gitlab-original.svg', alt: 'Gitlab' },
            { src: 'go/go-original.svg', alt: 'Go' },
            { src: 'rust/rust-original.svg', alt: 'Rust' },
            { src: 'terraform/terraform-original.svg', alt: 'Terraform' },
            { src: 'svelte/svelte-original.svg', alt: 'Svelte' },
            { src: 'astro/astro-original.svg', alt: 'Astro' },
            { src: 'redis/redis-original.svg', alt: 'Redis' },
            { src: 'llvm/llvm-original.svg', alt: 'LLVM' },
            { src: 'kubernetes/kubernetes-original.svg', alt: 'Kubernetes' },
            { src: 'jupyter/jupyter-original-wordmark.svg', alt: 'Jupyter' },
            { src: 'grafana/grafana-original.svg', alt: 'Grafana' },
            { src: 'graphql/graphql-plain.svg', alt: 'GraphQL' },
            {
              src: 'githubactions/githubactions-original.svg',
              alt: 'GitHub Actions',
            },
            { src: 'firebase/firebase-original.svg', alt: 'Firebase' },
          ].map((icon) => (
            <div
              key={icon.alt}
              className="hover:scale-[1.2] hover:rotate-[5deg] transition-transform"
            >
              <ReadmeImage
                src={`https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${icon.src}`}
                alt={icon.alt}
                width={44}
                height={44}
                className="w-11 h-11 grayscale-0 hover:grayscale transition-all duration-300"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Workspace Section */}
      <section className="flex flex-col gap-6 text-center p-8">
        <h4 className="text-2xl font-black italic uppercase tracking-tighter">
          My Workspace
        </h4>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            {
              src: 'https://img.shields.io/badge/Android%2013-3DDC84?style=for-the-badge&logo=android&logoColor=white',
              alt: 'Android',
            },
            {
              src: 'https://img.shields.io/badge/asus%20ROG%20Flow-000000?style=for-the-badge&logo=asus&logoColor=white',
              alt: 'Asus',
            },
            {
              src: 'https://img.shields.io/badge/windows%2011 insider-%230078D6.svg?&style=for-the-badge&logo=windows&logoColor=white',
              alt: 'Windows',
            },
            {
              src: 'https://img.shields.io/badge/Ubuntu%2024.04-E95420?style=for-the-badge&logo=ubuntu&logoColor=white',
              alt: 'Ubuntu',
            },
            {
              src: 'https://img.shields.io/badge/AMD%20Ryzen_9_5980HS-ED1C24?style=for-the-badge&logo=amd&logoColor=white',
              alt: 'AMD',
            },
            {
              src: 'https://img.shields.io/badge/RAM-32GB-%230071C5.svg?&style=for-the-badge&logoColor=white',
              alt: 'RAM',
            },
          ].map((badge) => (
            <div
              key={badge.alt}
              className="hover:scale-105 hover:-translate-y-0.5 transition-transform"
            >
              <ReadmeImage
                src={badge.src}
                alt={badge.alt}
                width={160}
                height={28}
                className="h-7 w-auto shadow-2xl"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Connect With Me Section */}
      <section className="flex flex-col gap-10 text-center p-10 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 blur-3xl" />
        <div className="flex flex-col gap-3 relative z-10">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter">
            Connect With Me
          </h2>
          <div className="flex justify-center">
            <ReadmeImage
              src="https://komarev.com/ghpvc/?username=mic-360&style=for-the-badge&color=blueviolet"
              alt="Profile views"
              width={176}
              height={28}
              className="h-8 w-auto"
            />
          </div>
        </div>

        <div className="flex flex-col gap-8 relative z-10">
          <p className="font-medium italic text-muted-foreground text-lg">
            Consider giving my work a ⭐ to show some ❤️
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            {[
              {
                href: 'https://www.facebook.com/fb.bhaumic.singh',
                src: 'https://img.shields.io/badge/Facebook-1877F2?style=flat&logo=facebook&logoColor=white&color=black',
                alt: 'Facebook',
              },
              {
                href: 'https://www.instagram.com/bhaumic.singh/',
                src: 'https://img.shields.io/badge/Instagram-E4405F?style=flat&logo=instagram&logoColor=white&color=black',
                alt: 'Instagram',
              },
              {
                href: 'https://www.linkedin.com/in/bhaumic/',
                src: 'https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white&color=black',
                alt: 'LinkedIn',
              },
              {
                href: 'https://x.com/bhaumicsingh',
                src: 'https://img.shields.io/badge/X-000000?style=flat&logo=x&logoColor=white&color=black',
                alt: 'X',
              },
            ].map((social) => (
              <a
                key={social.alt}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shadow-md hover:shadow-xl hover:scale-110 hover:-translate-y-0.5 transition-all overflow-hidden"
              >
                <ReadmeImage
                  src={social.src}
                  className="h-10 w-auto"
                  alt={social.alt}
                  width={120}
                  height={30}
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-center overflow-hidden border border-border/50 shadow-2xl">
        <ReadmeImage
          src="https://raw.githubusercontent.com/Mic-360/Mic-360/main/space-shooter.gif"
          alt="Space Shooter"
          width={640}
          height={360}
          className="w-full max-w-4xl h-auto"
        />
      </div>

      <footer>
        <Link
          to="/"
          className="group inline-flex items-center gap-2 italic text-muted-foreground hover:text-primary transition-colors text-lg"
        >
          <span className="transform group-hover:-translate-x-1 transition-transform">
            ←
          </span>
          back
        </Link>
      </footer>
    </article>
  )
}
