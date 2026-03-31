import { timingSafeEqual } from 'node:crypto'

import { env } from '@/env'

const API_KEY_HEADER = 'x-api-key'

function hasMatchingApiKey(receivedKey: string, expectedKey: string) {
  const receivedBuffer = Buffer.from(receivedKey)
  const expectedBuffer = Buffer.from(expectedKey)

  if (receivedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(receivedBuffer, expectedBuffer)
}

export function requirePostApiKey(request: Request) {
  const expectedApiKey = env.POST_API_KEY

  if (!expectedApiKey) {
    return Response.json(
      {
        status: 'error',
        message: 'POST API key is not configured on the server',
      },
      { status: 500 },
    )
  }

  const receivedApiKey = request.headers.get(API_KEY_HEADER)

  if (!receivedApiKey) {
    return Response.json(
      {
        status: 'error',
        message: 'Missing x-api-key header',
      },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'ApiKey' },
      },
    )
  }

  if (!hasMatchingApiKey(receivedApiKey, expectedApiKey)) {
    return Response.json(
      {
        status: 'error',
        message: 'Invalid x-api-key',
      },
      {
        status: 401,
        headers: { 'WWW-Authenticate': 'ApiKey' },
      },
    )
  }

  return null
}
