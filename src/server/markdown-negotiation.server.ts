import { NodeHtmlMarkdown } from 'node-html-markdown'

const nhm = new NodeHtmlMarkdown(
  {
    preferNativeParser: false,
    codeFence: '```',
    bulletMarker: '-',
    strongDelimiter: '**',
    emDelimiter: '*',
    keepDataImages: false,
    useLinkReferenceDefinitions: false,
    useInlineLinks: true,
    ignore: [
      'script',
      'style',
      'noscript',
      'nav',
      'footer',
      'svg',
      'iframe',
      'video',
      'audio',
      'canvas',
      'form',
      'button',
      '[aria-hidden="true"]',
      '[data-backlight]',
    ],
  },
  undefined,
  undefined,
)

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function wantsMarkdown(req: Request): boolean {
  const accept = req.headers.get('accept') || ''
  return accept.includes('text/markdown')
}

export function convertHtmlToMarkdown(html: string): {
  markdown: string
  tokens: number
} {
  const markdown = nhm.translate(html)
  return { markdown, tokens: estimateTokens(markdown) }
}
