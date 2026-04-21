import { createServerFn } from '@tanstack/react-start'

export type { PinterestCreatedPin, PinterestCreatedPinsPayload } from '@/server/pinterest.server'

export const getPinterestCreatedPins = createServerFn({ method: 'GET' })
	.handler(async () => {
		const { getPinterestCreatedPinsInternal } = await import('@/server/pinterest.server')
		return getPinterestCreatedPinsInternal()
	})