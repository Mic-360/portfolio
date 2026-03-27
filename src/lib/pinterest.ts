import { createServerFn } from '@tanstack/react-start'

export type { PinterestCreatedPin, PinterestCreatedPinsPayload } from './pinterest.server'

export const getPinterestCreatedPins = createServerFn({ method: 'GET' })
	.handler(async () => {
		const { getPinterestCreatedPinsInternal } = await import('./pinterest.server')
		return getPinterestCreatedPinsInternal()
	})