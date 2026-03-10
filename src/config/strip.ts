import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import url from 'node:url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

const publicDir = path.join(__dirname, '..', '..', 'public')

async function* getFiles(dir: string): AsyncGenerator<string> {
  const dirents = await fs.promises.readdir(dir, { withFileTypes: true })
  for (const dirent of dirents) {
    const res = path.resolve(dir, dirent.name)
    if (dirent.isDirectory()) {
      yield* getFiles(res)
    } else {
      yield res
    }
  }
}

async function processImages(): Promise<void> {
  console.log(`🔍 Scanning for images in: ${publicDir}`)

  if (!fs.existsSync(publicDir)) {
    console.error(`❌ Error: Directory not found: ${publicDir}`)
    return
  }

  let count = 0
  for await (const f of getFiles(publicDir)) {
    const ext = path.extname(f).toLowerCase()
    if (['.png', '.jpg', '.jpeg'].includes(ext)) {
      const tempPath = `${f}.tmp`
      try {
        await sharp(f).toFile(tempPath)
        await fs.promises.rename(tempPath, f)
        console.log(`✅ Stripped metadata: ${path.relative(publicDir, f)}`)
        count++
      } catch (err) {
        if (err instanceof Error) {
          console.error(`❌ Error stripping ${f}:`, err.message)
        } else {
          console.error(`❌ Error stripping ${f}:`, String(err))
        }
        // Cleanup temp file if it exists
        if (fs.existsSync(tempPath)) {
          await fs.promises.unlink(tempPath)
        }
      }
    }
  }
  console.log(`\n✨ Finished processing ${count} images.`)
}

processImages().catch((err) => {
  console.error('💥 Fatal error:', err)
  process.exit(1)
})

