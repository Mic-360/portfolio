import handler from '@tanstack/react-start/server-entry'

export default {
  async fetch(req: Request): Promise<Response> {
    const url = new URL(req.url)
    if (url.hostname === 'www.bhaumicsingh.dev') {
      url.hostname = 'bhaumicsingh.dev'
      return Response.redirect(url.toString(), 301)
    }

    const response = await handler.fetch(req)
    
    // Create new headers object to avoid immutable headers error
    const newHeaders = new Headers(response.headers)
    newHeaders.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    })
  },
}
