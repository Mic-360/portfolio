import { createSign } from 'node:crypto'

const PRIVATE_JWK = {
  crv: 'Ed25519',
  d: 'hg_vlZhtte6AgjtrSHFnep_ETe-TI687Hy8MkMAbuF4',
  x: 'FrUk-IeJLhYQKqL3TZjVvFDGUDXhEFtaUcOcfHrLgNY',
  kty: 'OKP',
} as const

const PUBLIC_JWK = {
  crv: 'Ed25519',
  x: 'FrUk-IeJLhYQKqL3TZjVvFDGUDXhEFtaUcOcfHrLgNY',
  kty: 'OKP',
} as const

const THUMBPRINT = 'i_fnByuN-kFo7u_1mXA7-QTOVSB80wKMm26RFHErIRw'

const JWKS_BODY = JSON.stringify({ keys: [PUBLIC_JWK] })

function signDirectory(authority: string): {
  body: string
  signature: string
  signatureInput: string
} {
  const now = Math.floor(Date.now() / 1000)
  const expires = now + 86400

  const nonce = Buffer.from(
    globalThis.crypto.getRandomValues(new Uint8Array(32)),
  ).toString('base64')

  const signatureInput = `sig1=("@authority";req);alg="ed25519";keyid="${THUMBPRINT}";nonce="${nonce}";tag="http-message-signatures-directory";created=${now};expires=${expires}`

  const signatureBase = `"@authority";req: ${authority}\n"@signature-params": ("@authority";req);alg="ed25519";keyid="${THUMBPRINT}";nonce="${nonce}";tag="http-message-signatures-directory";created=${now};expires=${expires}`

  const privateKey = createSign('ed25519')
  privateKey.update(signatureBase)
  const sig = privateKey
    .sign({
      key: Buffer.from(
        JSON.stringify({
          ...PRIVATE_JWK,
          key_ops: ['sign'],
        }),
      ),
      format: 'jwk',
    })
    .toString('base64')

  return {
    body: JWKS_BODY,
    signature: `sig1=:${sig}:`,
    signatureInput,
  }
}

export function handleWebBotAuthDirectory(
  req: Request,
): Response | null {
  const url = new URL(req.url)
  if (
    url.pathname.toLowerCase() !==
    '/.well-known/http-message-signatures-directory'
  )
    return null

  const authority = url.host

  const { body, signature, signatureInput } = signDirectory(authority)

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/http-message-signatures-directory+json',
      Signature: signature,
      'Signature-Input': signatureInput,
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'Strict-Transport-Security':
        'max-age=31536000; includeSubDomains; preload',
      'Access-Control-Allow-Origin': '*',
    },
  })
}
