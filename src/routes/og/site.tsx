import { createOgImageResponse } from '@/lib/og.server'
import { siteInfo, siteMeta } from '@/lib/site-data'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/og/site')({
  server: {
    handlers: {
      GET: async () =>
        createOgImageResponse({
          title: siteInfo.name,
          description: siteMeta.defaultDescription,
          label: 'Portfolio',
        }),
    },
  },
})
