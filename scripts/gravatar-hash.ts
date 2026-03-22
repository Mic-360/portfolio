/**
 * CLI utility: compute the Gravatar hash, avatar URL, and profile URL for an email.
 *
 * Usage:
 *   npx tsx scripts/gravatar-hash.ts email@example.com
 */

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('Usage: npx tsx scripts/gravatar-hash.ts <email>')
    process.exit(1)
  }

  // ── Normalize ────────────────────────────────────────────────────
  const normalized = email.trim().toLowerCase()

  // ── Hash (SHA-256 via Node built-in) ──────────────────────────────
  const { createHash } = await import('node:crypto')
  const hash = createHash('sha256').update(normalized).digest('hex')

  // ── Build URLs ────────────────────────────────────────────────────
  const avatarUrl = `https://gravatar.com/avatar/${hash}?s=256&d=identicon&r=g`
  const profileUrl = `https://api.gravatar.com/v3/profiles/${hash}`

  console.log()
  console.log('  Gravatar Hash Tool')
  console.log('  ══════════════════════════════════════════')
  console.log(`  Email      : ${normalized}`)
  console.log(`  SHA-256    : ${hash}`)
  console.log(`  Avatar URL : ${avatarUrl}`)
  console.log(`  Profile URL: ${profileUrl}`)
  console.log()
}

main()
