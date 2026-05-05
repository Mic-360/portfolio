import type { AnyRouteMatch } from '@tanstack/react-router'
import { env } from '@/env'
import { gravatar, siteImages, siteInfo, siteMeta } from '@/config/site-data'
import appCss from '@/styles.css?url'

export const getDefaultSeoConfig = (): {
  links?: AnyRouteMatch['links']
  scripts?: AnyRouteMatch['headScripts']
  meta?: AnyRouteMatch['meta']
  styles?: AnyRouteMatch['styles']
} => {
  const meta = [
    {
      charSet: 'utf-8',
    },
    {
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    },
    {
      name: 'theme-color',
      content: siteMeta.themeColor,
    },
    {
      name: 'robots',
      content:
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    {
      name: 'googlebot',
      content:
        'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    },
    {
      name: 'bingbot',
      content: 'index, follow',
    },
    {
      property: 'og:site_name',
      content: siteMeta.siteName,
    },
    {
      property: 'og:locale',
      content: siteMeta.locale,
    },
    {
      name: 'twitter:site',
      content: siteMeta.twitterHandle,
    },
    {
      name: 'twitter:creator',
      content: siteMeta.twitterHandle,
    },
    {
      name: 'twitter:card',
      content: 'summary_large_image',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:title',
      content: siteMeta.defaultTitle,
    },
    {
      property: 'og:description',
      content: siteMeta.defaultDescription,
    },
    {
      property: 'og:url',
      content: siteMeta.baseUrl,
    },
    {
      property: 'og:image',
      content: `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
    },
    {
      property: 'og:image:width',
      content: '1200',
    },
    {
      property: 'og:image:height',
      content: '630',
    },
    {
      property: 'og:image:type',
      content: 'image/png',
    },
    {
      property: 'og:image:alt',
      content: siteMeta.defaultTitle,
    },
    {
      name: 'twitter:title',
      content: siteMeta.defaultTitle,
    },
    {
      name: 'twitter:description',
      content: siteMeta.defaultDescription,
    },
    {
      name: 'twitter:image',
      content: `${siteMeta.baseUrl}${siteMeta.defaultImage}`,
    },
    {
      name: 'twitter:image:alt',
      content: siteMeta.defaultTitle,
    },
    {
      title: 'Bhaumic Singh — Full Stack Software Engineer Portfolio',
    },
    {
      name: 'description',
      content: siteMeta.defaultDescription,
    },
    {
      name: 'author',
      content: siteInfo.name,
    },
    {
      name: 'creator',
      content: siteInfo.name,
    },
    {
      name: 'publisher',
      content: siteInfo.name,
    },
    {
      name: 'keywords',
      content: siteMeta.keywords,
    },
    {
      name: 'geo.region',
      content: 'IN-UP',
    },
    {
      name: 'geo.placename',
      content: siteInfo.location,
    },
    {
      property: 'profile:first_name',
      content: 'Bhaumic',
    },
    {
      property: 'profile:last_name',
      content: 'Singh',
    },
    {
      property: 'profile:username',
      content: 'bhaumic',
    },
    {
      name: 'color-scheme',
      content: 'dark light',
    },
    {
      name: 'format-detection',
      content: 'telephone=no',
    },
  ]

  if (env.VITE_GOOGLE_SITE_VERIFICATION) {
    meta.push({
      name: 'google-site-verification',
      content: env.VITE_GOOGLE_SITE_VERIFICATION,
    })
  }

  if (env.VITE_BING_SITE_VERIFICATION) {
    meta.push({
      name: 'msvalidate.01',
      content: env.VITE_BING_SITE_VERIFICATION,
    })
  }

  if (env.VITE_YANDEX_SITE_VERIFICATION) {
    meta.push({
      name: 'yandex-verification',
      content: env.VITE_YANDEX_SITE_VERIFICATION,
    })
  }

  return {
    meta,
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: siteMeta.siteName,
          url: siteMeta.baseUrl,
          description: siteMeta.defaultDescription,
          inLanguage: 'en-US',
          publisher: {
            '@type': 'Person',
            name: siteInfo.name,
            url: siteMeta.baseUrl,
            image: `${siteMeta.baseUrl}${siteImages.profilePhoto}`,
            sameAs: [
              'https://github.com/Mic-360',
              'https://x.com/bhaumicsingh',
              'https://www.linkedin.com/in/bhaumic/',
              'https://www.instagram.com/bhaumic.singh/',
              gravatar.profileUrl,
              gravatar.verifiedDomain,
            ],
          },
        }),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: siteInfo.name,
          alternateName: ['Bhaumic', 'भौमिक सिंह'],
          url: siteMeta.baseUrl,
          image: [
            `${siteMeta.baseUrl}${siteImages.profilePhoto}`,
            gravatar.avatarUrl,
          ],
          jobTitle: siteInfo.currentRole,
          worksFor: {
            '@type': 'Organization',
            name: siteInfo.currentCompany,
            url: siteInfo.currentCompanyUrl,
          },
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Prayagraj',
            addressRegion: 'Uttar Pradesh',
            addressCountry: 'IN',
          },
          alumniOf: {
            '@type': 'CollegeOrUniversity',
            name: 'ITER, SOA University',
          },
          knowsAbout: [
            'React',
            'Next.js',
            'Flutter',
            'Rust',
            'Full Stack Web Development',
            'Android Development',
            'Artificial Intelligence (AI)',
            'Cloud Computing',
            'DevOps',
            'TypeScript',
            'Go',
            'Python',
          ],
          sameAs: [
            'https://github.com/Mic-360',
            'https://x.com/bhaumicsingh',
            'https://www.linkedin.com/in/bhaumic/',
            'https://www.instagram.com/bhaumic.singh/',
            gravatar.profileUrl,
            gravatar.verifiedDomain,
          ],
        }),
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '192x192',
        href: '/web-app-manifest-192x192.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '512x512',
        href: '/web-app-manifest-512x512.png',
      },
      {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'alternate',
        type: 'application/rss+xml',
        title: 'Bhaumic Singh — RSS Feed',
        href: '/rss',
      },
      {
        rel: 'alternate',
        type: 'text/plain',
        title: 'Bhaumic Singh — LLMs full context',
        href: '/llms-full.txt',
      },
      {
        rel: 'me',
        href: gravatar.profileUrl,
      },
      {
        rel: 'me',
        href: 'https://github.com/Mic-360',
      },
      {
        rel: 'me',
        href: 'https://x.com/bhaumicsingh',
      },
      {
        rel: 'me',
        href: 'https://www.linkedin.com/in/bhaumic/',
      },
      {
        rel: 'author',
        href: '/humans.txt',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.googleapis.com',
      },
      {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        as: 'style',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Fira+Code:wght@400;500&display=swap',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&family=Fira+Code:wght@400;500&display=swap',
        media: 'print',
        'data-font-async': 'true',
      } as { rel: string; href: string; media: string },
      {
        rel: 'preconnect',
        href: 'https://gravatar.com',
      },
    ],
  }
}
