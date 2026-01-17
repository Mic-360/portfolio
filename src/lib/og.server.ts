import { Resvg } from '@resvg/resvg-js'
import { siteMeta } from './site-data'

type OgImageOptions = {
	title: string
	description?: string
	label?: string
	date?: string
}

function escapeXml(input: string) {
	return input
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/'/g, '&apos;')
}

function buildOgSvg({ title, description, label, date }: OgImageOptions) {
	const safeTitle = escapeXml(title)
	const safeDescription = description ? escapeXml(description) : ''
	const safeLabel = label ? escapeXml(label) : ''
	const safeDate = date ? escapeXml(date) : ''

	return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0f14" />
      <stop offset="100%" stop-color="#0f172a" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="60" y="60" width="1080" height="510" rx="28" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" />
  <foreignObject x="110" y="110" width="980" height="410">
    <div xmlns="http://www.w3.org/1999/xhtml" style="display:flex;flex-direction:column;gap:20px;height:100%;color:#e2e8f0;font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
      <div style="font-size:20px;letter-spacing:0.2em;text-transform:uppercase;color:#7dd3fc;">${safeLabel}</div>
      <div style="font-size:58px;font-weight:700;line-height:1.1;">${safeTitle}</div>
      ${safeDescription ? `<div style="font-size:26px;line-height:1.5;color:#cbd5f5;max-height:140px;overflow:hidden;">${safeDescription}</div>` : ''}
      <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;font-size:20px;color:#94a3b8;">
        <span>${escapeXml(siteMeta.defaultTitle)}</span>
        <span>${safeDate}</span>
      </div>
    </div>
  </foreignObject>
</svg>`
}

export function createOgImageResponse(options: OgImageOptions) {
	const svg = buildOgSvg(options)
	const resvg = new Resvg(svg, {
		fitTo: {
			mode: 'width',
			value: 1200,
		},
	})
	const pngData = resvg.render()
	const pngBuffer = pngData.asPng()
	const pngBody = new Uint8Array(pngBuffer)

	return new Response(pngBody, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400, s-maxage=86400',
		},
	})
}
