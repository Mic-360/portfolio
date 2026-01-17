import { createFileRoute } from '@tanstack/react-router'
import { createOgImageResponse } from '@/lib/og.server'
import { siteInfo, siteMeta } from '@/lib/site-data'

export const Route = createFileRoute('/og/site')({
  server: {
    handlers: {
      GET: async () =>
        await createOgImageResponse({
          title: siteInfo.name,
          description: siteMeta.defaultDescription,
          label: 'Portfolio',
        }),
    },
  },
})
