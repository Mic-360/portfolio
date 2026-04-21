import { createServerOnlyFn } from '@tanstack/react-start'
import { requirePostApiKeyInternal } from './api-auth.server'

export const requirePostApiKey = createServerOnlyFn((request: Request) => {
	return requirePostApiKeyInternal(request)
})