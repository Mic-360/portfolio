import compiler from 'node-latex-compiler'
import {
  access,
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const { compile } = compiler
const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const contentDir = join(rootDir, 'src', 'content')
const publicDir = join(rootDir, 'public')
const sourceTex = join(contentDir, 'resume.tex')
const sourceClass = join(contentDir, 'bhaumic.cls')
const outputPdf = join(publicDir, 'CV_Bhaumic_Singh.pdf')
const outputName = 'CV_Bhaumic_Singh.pdf'

async function assertFile(filePath, label) {
  try {
    await access(filePath)
  } catch {
    throw new Error(`${label} not found at ${relative(rootDir, filePath)}`)
  }
}

function normalizeLatexSource(source) {
  return source
    .replace(/—/g, '---')
    .replace(/–/g, '--')
    .replace(/×/g, '$\\times$')
    .replace(/→/g, '$\\to$')
    .replace(/ /g, '\\,')
}

async function buildResume() {
  await assertFile(sourceTex, 'Resume source')
  await assertFile(sourceClass, 'Resume class')
  await mkdir(publicDir, { recursive: true })

  const workDir = await mkdtemp(join(tmpdir(), 'portfolio-resume-'))
  const workTex = join(workDir, 'resume.tex')
  const workClass = join(workDir, 'bhaumic.cls')
  const workPdf = join(workDir, outputName)

  try {
    const tex = await readFile(sourceTex, 'utf8')
    await writeFile(workTex, normalizeLatexSource(tex))
    await copyFile(sourceClass, workClass)

    const stderr = []
    const result = await compile({
      texFile: workTex,
      outputDir: workDir,
      outputFile: workPdf,
      onStderr: (data) => stderr.push(String(data)),
    })

    if (result.status !== 'success') {
      const details = [result.error, result.stderr, stderr.join('')]
        .filter(Boolean)
        .join('\n')
      throw new Error(details || 'LaTeX compilation failed')
    }

    await copyFile(result.pdfPath || workPdf, outputPdf)
    const { size } = await stat(outputPdf)
    const kb = Math.round(size / 1024)
    console.log(`Generated ${relative(rootDir, outputPdf)} (${kb} KB)`)
  } finally {
    await rm(workDir, { recursive: true, force: true })
  }
}

buildResume().catch(async (error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.warn(`\n⚠️  Resume generation skipped: ${message}`)

  try {
    await stat(outputPdf)
    console.log(`✅ Using existing resume at ${relative(rootDir, outputPdf)}\n`)
    process.exitCode = 0
  } catch {
    console.error(`❌ CRITICAL: Resume generation failed and no existing PDF found at ${relative(rootDir, outputPdf)}`)
    process.exitCode = 1
  }
})
