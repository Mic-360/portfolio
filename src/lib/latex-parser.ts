// LaTeX-to-HTML parser for Bhaumic CV class resume rendering
// Converts Bhaumic CV class LaTeX commands into semantic HTML
// Also supports legacy Russell CV class commands for backwards compatibility

export interface LatexResumeData {
  html: string
  title: string
  author: string
  date: string
  summary: string
}

/**
 * Detect which document class is being used
 */
function detectDocumentClass(preamble: string): 'bhaumic' | 'russell' {
  if (
    /\\documentclass\{bhaumic\}/.test(preamble) ||
    /\\makeheader/.test(preamble) ||
    /\\ressection/.test(preamble)
  ) {
    return 'bhaumic'
  }
  return 'russell'
}

/**
 * Extract metadata from the preamble — bhaumic class
 * Header is in the body: \makeheader{first}{last}{position}{phone}{email}{github}{linkedin}
 */
function extractMetadataBhaumic(body: string): {
  firstName: string
  lastName: string
  position: string
  phone: string
  email: string
  github: string
  linkedin: string
} {
  const headerMatch = body.match(/\\makeheader\s*\n?\s*/)
  if (!headerMatch) {
    return {
      firstName: '',
      lastName: '',
      position: '',
      phone: '',
      email: '',
      github: '',
      linkedin: '',
    }
  }

  let pos = (headerMatch.index ?? 0) + headerMatch[0].length
  const args: Array<string> = []
  for (let i = 0; i < 7; i++) {
    const [content, nextPos] = extractBraceGroup(body, pos)
    args.push(content)
    pos = nextPos
  }

  return {
    firstName: stripLatexCommands(args[0] ?? ''),
    lastName: stripLatexCommands(args[1] ?? ''),
    position: (args[2] ?? '')
      .replace(/\\textbar\{\}/g, '|')
      .replace(/\\&/g, '&'),
    phone: args[3] ?? '',
    email: args[4] ?? '',
    github: args[5] ?? '',
    linkedin: args[6] ?? '',
  }
}

/**
 * Extract metadata from the preamble — russell class (legacy)
 */
function extractMetadataRussell(preamble: string): {
  firstName: string
  lastName: string
  position: string
  phone: string
  email: string
  github: string
  linkedin: string
} {
  const nameMatch = preamble.match(/\\name\s*\{([^}]*)\}\s*\{([^}]*)\}/)
  const posMatch = preamble.match(/\\position\{([^}]*)\}/)
  const githubMatch = preamble.match(/\\github\{([^}]*)\}/)
  const linkedinMatch = preamble.match(/\\linkedin\{([^}]*)\}/)

  return {
    firstName: stripLatexCommands(nameMatch?.[1] ?? ''),
    lastName: stripLatexCommands(nameMatch?.[2] ?? ''),
    position: posMatch?.[1]?.replace(/\\&/g, '&') ?? '',
    phone: '',
    email: '',
    github: githubMatch?.[1] ?? '',
    linkedin: linkedinMatch?.[1] ?? '',
  }
}

const stripLatexCommands = (s: string) =>
  s
    .replace(
      /\\(?:LARGE|Large|large|huge|Huge|normalsize|textbf|textit|bfseries|itshape)\s*/g,
      '',
    )
    .trim()

/**
 * Find the matching closing brace for an opening brace at `pos`
 */
function findMatchingBrace(text: string, pos: number): number {
  if (text[pos] !== '{') return -1

  let depth = 1
  let i = pos + 1

  while (i < text.length && depth > 0) {
    if (text[i] === '{' && text[i - 1] !== '\\') depth++
    else if (text[i] === '}' && text[i - 1] !== '\\') depth--
    i++
  }

  return depth === 0 ? i - 1 : -1
}

/**
 * Extract the content of a brace group starting at `pos`
 * Returns [content, endPos] where endPos is after the closing brace
 */
function extractBraceGroup(text: string, pos: number): [string, number] {
  // Skip whitespace to find opening brace
  let i = pos
  while (i < text.length && /\s/.test(text[i])) i++

  if (i >= text.length || text[i] !== '{') return ['', pos]

  const end = findMatchingBrace(text, i)
  if (end === -1) return ['', pos]

  return [text.substring(i + 1, end), end + 1]
}

/**
 * Process inline LaTeX formatting commands
 */
function processInline(text: string): string {
  let result = text

  // Remove stray braces wrapping content (e.g. {some text})
  // Do this carefully — only top-level wrapping braces
  result = result.replace(/^\{(.*)\}$/, '$1')

  // \hyperlink{url}{text} → <a>
  result = result.replace(
    /\\hyperlink\{([^}]*)\}\{([^}]*)\}/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
  )

  // \href{url}{text} → <a>
  result = result.replace(
    /\\href\{([^}]*)\}\{([^}]*)\}/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer">$2</a>',
  )

  // \textbf{...} → <strong>
  result = processCommandSimple(result, 'textbf', 'strong')

  // \textit{...} → <em>
  result = processCommandSimple(result, 'textit', 'em')

  // \texttt{...} → <code>
  result = processCommandSimple(result, 'texttt', 'code')

  // Remove \LARGE, \Large, \large, etc.
  result = result.replace(
    /\\(?:LARGE|Large|large|small|tiny|huge|Huge|normalsize|footnotesize|scriptsize)\s*/g,
    '',
  )

  // LaTeX special characters
  result = result.replace(/\\&/g, '&amp;')
  result = result.replace(/\\%/g, '%')
  result = result.replace(/\\_/g, '_')
  result = result.replace(/\\#/g, '#')
  result = result.replace(/\\~/g, '&nbsp;')
  result = result.replace(/~/g, '&nbsp;')

  // em-dash and en-dash
  result = result.replace(/---/g, '&mdash;')
  result = result.replace(/--/g, '&ndash;')

  // \\ line break (but not \\ at end of tabular lines)
  result = result.replace(/\\\\/g, '<br/>')

  // > symbol (e.g. >99%)
  result = result.replace(/&gt;/g, '>')

  // Clean leftover braces
  result = result.replace(/\{([^{}]*)\}/g, '$1')

  return result.trim()
}

/**
 * Simple command replacement: \command{content} → <tag>content</tag>
 */
function processCommandSimple(
  text: string,
  command: string,
  htmlTag: string,
): string {
  const regex = new RegExp(`\\\\${command}\\{`, 'g')
  let result = text
  let match: RegExpExecArray | null

  // Reset regex
  regex.lastIndex = 0

  while ((match = regex.exec(result)) !== null) {
    const braceStart = match.index + match[0].length - 1
    const braceEnd = findMatchingBrace(result, braceStart)

    if (braceEnd === -1) break

    const inner = result.substring(braceStart + 1, braceEnd)
    const before = result.substring(0, match.index)
    const after = result.substring(braceEnd + 1)

    result = `${before}<${htmlTag}>${inner}</${htmlTag}>${after}`
    regex.lastIndex = 0 // Reset since string changed
  }

  return result
}

/**
 * Parse \begin{cvitems} or \begin{resbullets} into a list
 */
function parseBulletItems(content: string): string {
  const items: Array<string> = []
  const lines = content.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (trimmed.startsWith('\\item')) {
      let itemText = trimmed.replace(/^\\item\s*/, '')
      itemText = itemText.replace(/^\{(.*)\}$/, '$1')
      if (itemText) {
        items.push(processInline(itemText))
      }
    }
  }

  if (items.length === 0) return ''

  const lis = items.map((item) => `      <li>${item}</li>`).join('\n')
  return `    <ul class="cv-items">\n${lis}\n    </ul>`
}

/**
 * Parse a single \cvskill or \skillrow command: {type}{skillset}
 */
function parseSkillRow(type: string, skillset: string): string {
  return `  <div class="cv-skill-row">
    <span class="cv-skill-type">${processInline(type)}</span>
    <span class="cv-skill-set">${processInline(skillset)}</span>
  </div>`
}

/**
 * Parse a single \cvhonor{position}{title}{issuer}{date} command (russell)
 */
function parseCvHonor(
  position: string,
  _title: string,
  issuer: string,
  date: string,
): string {
  return `  <div class="cv-honor-row">
    <span class="cv-honor-date">${processInline(date)}</span>
    <span class="cv-honor-position">${processInline(position)}</span>
    <span class="cv-honor-issuer">${processInline(issuer)}</span>
  </div>`
}

/**
 * Parse a single \certrow{name}{issuer}{status}{date} command (bhaumic)
 */
function parseCertRow(
  name: string,
  issuer: string,
  _status: string,
  date: string,
): string {
  return `  <div class="cv-honor-row">
    <span class="cv-honor-date">${processInline(date)}</span>
    <span class="cv-honor-position">${processInline(name)}</span>
    <span class="cv-honor-issuer">${processInline(issuer)}</span>
  </div>`
}

/**
 * Parse \begin{skilltable} or \begin{cvskills} blocks
 */
function parseSkillsBlock(content: string): string {
  const skills: Array<string> = []
  const regex = /\\(?:cvskill|skillrow)\s*\{/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    const typeStart = content.lastIndexOf(
      '{',
      match.index + match[0].length - 1,
    )
    const typeEnd = findMatchingBrace(content, typeStart)
    if (typeEnd === -1) continue

    const type = content.substring(typeStart + 1, typeEnd)
    const [skillset, endPos] = extractBraceGroup(content, typeEnd + 1)
    if (endPos === typeEnd + 1) continue

    skills.push(parseSkillRow(type, skillset))
    regex.lastIndex = endPos
  }

  return `<div class="cv-skills">\n${skills.join('\n')}\n</div>`
}

/**
 * Parse \begin{cvhonors} block (russell)
 */
function parseCvHonorsBlock(content: string): string {
  const honors: Array<string> = []
  const regex = /\\cvhonor\s*\n?\s*\{/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    const posStart = content.lastIndexOf('{', match.index + match[0].length - 1)
    const posEnd = findMatchingBrace(content, posStart)
    if (posEnd === -1) continue
    const position = content.substring(posStart + 1, posEnd)

    const [title, afterTitle] = extractBraceGroup(content, posEnd + 1)
    const [issuer, afterIssuer] = extractBraceGroup(content, afterTitle)
    const [date, afterDate] = extractBraceGroup(content, afterIssuer)

    honors.push(parseCvHonor(position, title, issuer, date))
    regex.lastIndex = afterDate
  }

  return `<div class="cv-honors">\n${honors.join('\n')}\n</div>`
}

/**
 * Parse \certrow commands in a section (bhaumic)
 */
function parseCertRowsBlock(content: string): string {
  const certs: Array<string> = []
  const regex = /\\certrow\s*\n?\s*\{/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    const nameStart = content.lastIndexOf(
      '{',
      match.index + match[0].length - 1,
    )
    const nameEnd = findMatchingBrace(content, nameStart)
    if (nameEnd === -1) continue
    const name = content.substring(nameStart + 1, nameEnd)

    const [issuer, afterIssuer] = extractBraceGroup(content, nameEnd + 1)
    const [status, afterStatus] = extractBraceGroup(content, afterIssuer)
    const [date, afterDate] = extractBraceGroup(content, afterStatus)

    certs.push(parseCertRow(name, issuer, status, date))
    regex.lastIndex = afterDate
  }

  return `<div class="cv-honors">\n${certs.join('\n')}\n</div>`
}

/**
 * Extract bullet description from an entry's content (handles both cvitems and resbullets)
 */
function extractBullets(description: string): string {
  const match = description.match(
    /\\begin\{(?:cvitems|resbullets)\}([\s\S]*?)\\end\{(?:cvitems|resbullets)\}/,
  )
  return match ? parseBulletItems(match[1]) : ''
}

/**
 * Parse \begin{cventries}...\end{cventries} block (russell)
 */
function parseCvEntriesBlock(content: string): string {
  const entries: Array<string> = []
  const regex = /\\cventry\s*\n?\s*\{/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    const entryStart = match.index
    let pos = content.indexOf('{', entryStart)
    const args: Array<string> = []

    for (let i = 0; i < 5; i++) {
      while (
        pos < content.length &&
        /\s/.test(content[pos]) &&
        content[pos] !== '{'
      )
        pos++
      if (content[pos] !== '{') {
        const nextBrace = content.indexOf('{', pos)
        if (nextBrace === -1) break
        pos = nextBrace
      }
      const braceEnd = findMatchingBrace(content, pos)
      if (braceEnd === -1) break
      args.push(content.substring(pos + 1, braceEnd))
      pos = braceEnd + 1
    }

    if (args.length >= 5) {
      const [position, title, locationOrDate, typeOrDate, description] = args
      const descHtml = extractBullets(description)

      entries.push(`  <div class="cv-entry">
    <div class="cv-entry-header">
      <div class="cv-entry-left">
        ${processInline(title) ? `<span class="cv-entry-title">${processInline(title)}</span>` : ''}
        ${processInline(position) ? `<span class="cv-entry-position">${processInline(position)}</span>` : ''}
      </div>
      <div class="cv-entry-right">
        ${processInline(locationOrDate) ? `<span class="cv-entry-location">${processInline(locationOrDate)}</span>` : ''}
        ${processInline(typeOrDate) ? `<span class="cv-entry-date">${processInline(typeOrDate)}</span>` : ''}
      </div>
    </div>
${descHtml}
  </div>`)
      regex.lastIndex = pos
    }
  }

  return `<div class="cv-entries">\n${entries.join('\n')}\n</div>`
}

/**
 * Parse \expentry commands (bhaumic): {title}{company}{dates}{type}{bullets}
 */
function parseExpEntries(content: string): string {
  const entries: Array<string> = []
  const regex = /\\expentry\s*\n?\s*\{/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    let pos = content.lastIndexOf('{', match.index + match[0].length - 1)
    const args: Array<string> = []

    for (let i = 0; i < 5; i++) {
      while (
        pos < content.length &&
        /\s/.test(content[pos]) &&
        content[pos] !== '{'
      )
        pos++
      const braceEnd = findMatchingBrace(content, pos)
      if (braceEnd === -1) break
      args.push(content.substring(pos + 1, braceEnd))
      pos = braceEnd + 1
    }

    if (args.length >= 5) {
      const [title, company, dates, type, description] = args
      const descHtml = extractBullets(description)

      entries.push(`  <div class="cv-entry">
    <div class="cv-entry-header">
      <div class="cv-entry-left">
        <span class="cv-entry-title">${processInline(company)}</span>
        <span class="cv-entry-position">${processInline(title)}</span>
      </div>
      <div class="cv-entry-right">
        <span class="cv-entry-location">${processInline(dates)}</span>
        <span class="cv-entry-date">${processInline(type)}</span>
      </div>
    </div>
${descHtml}
  </div>`)
      regex.lastIndex = pos
    }
  }

  return entries.length > 0
    ? `<div class="cv-entries">\n${entries.join('\n')}\n</div>`
    : ''
}

/**
 * Parse \projentry commands (bhaumic): {description}{name}{linkLabel}{linkUrl}{bullets}
 */
function parseProjEntries(content: string): string {
  const entries: Array<string> = []
  const regex = /\\projentry\s*\n?\s*\{/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    let pos = content.lastIndexOf('{', match.index + match[0].length - 1)
    const args: Array<string> = []

    for (let i = 0; i < 5; i++) {
      while (
        pos < content.length &&
        /\s/.test(content[pos]) &&
        content[pos] !== '{'
      )
        pos++
      const braceEnd = findMatchingBrace(content, pos)
      if (braceEnd === -1) break
      args.push(content.substring(pos + 1, braceEnd))
      pos = braceEnd + 1
    }

    if (args.length >= 5) {
      const [desc, name, linkLabel, linkUrl, description] = args
      const descHtml = extractBullets(description)
      const linkHtml = linkUrl
        ? `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer">${processInline(linkLabel)}</a>`
        : ''

      entries.push(`  <div class="cv-entry">
    <div class="cv-entry-header">
      <div class="cv-entry-left">
        <span class="cv-entry-title">${processInline(name)}</span>
        <span class="cv-entry-position">${processInline(desc)}</span>
      </div>
      <div class="cv-entry-right">
        ${linkHtml ? `<span class="cv-entry-location">${linkHtml}</span>` : ''}
      </div>
    </div>
${descHtml}
  </div>`)
      regex.lastIndex = pos
    }
  }

  return entries.length > 0
    ? `<div class="cv-entries">\n${entries.join('\n')}\n</div>`
    : ''
}

/**
 * Parse \eduentry command (bhaumic): {degree}{institution}{dates}{gpa}
 * Plus any trailing coursework text
 */
function parseEduEntries(content: string): string {
  const entries: Array<string> = []
  const regex = /\\eduentry\s*\n?\s*\{/g
  let match: RegExpExecArray | null

  while ((match = regex.exec(content)) !== null) {
    let pos = content.lastIndexOf('{', match.index + match[0].length - 1)
    const args: Array<string> = []

    for (let i = 0; i < 4; i++) {
      while (
        pos < content.length &&
        /\s/.test(content[pos]) &&
        content[pos] !== '{'
      )
        pos++
      const braceEnd = findMatchingBrace(content, pos)
      if (braceEnd === -1) break
      args.push(content.substring(pos + 1, braceEnd))
      pos = braceEnd + 1
    }

    if (args.length >= 4) {
      const [degree, institution, dates, gpa] = args

      // Look for trailing coursework text after the eduentry
      let extraHtml = ''
      const remaining = content.substring(pos)
      const courseworkMatch = remaining.match(
        /\\textbf\{Relevant Coursework:\}([\s\S]*?)(?=\\|$)/,
      )
      if (courseworkMatch) {
        const courses = processInline(
          courseworkMatch[1].replace(/\\textbullet\{\}/g, '·').trim(),
        )
        extraHtml = `\n    <p class="cv-entry-coursework"><strong>Relevant Coursework:</strong> ${courses}</p>`
      }

      entries.push(`  <div class="cv-entry">
    <div class="cv-entry-header">
      <div class="cv-entry-left">
        <span class="cv-entry-title">${processInline(institution)}</span>
        <span class="cv-entry-position">${processInline(degree)}</span>
      </div>
      <div class="cv-entry-right">
        <span class="cv-entry-location">${processInline(dates)}</span>
        <span class="cv-entry-date">${processInline(gpa.replace(/\\textbar\{\}/g, '|'))}</span>
      </div>
    </div>${extraHtml}
  </div>`)
      regex.lastIndex = pos
    }
  }

  return entries.length > 0
    ? `<div class="cv-entries">\n${entries.join('\n')}\n</div>`
    : ''
}

/**
 * Parse \begin{resumesummary}...\end{resumesummary} block
 */
function parseSummaryBlock(content: string): string {
  return `<div class="cv-summary"><p>${processInline(content.trim())}</p></div>`
}

/**
 * Parse the body of the document
 */
function parseBody(
  body: string,
  meta: {
    firstName: string
    lastName: string
    position: string
    phone: string
    email: string
    github: string
    linkedin: string
  },
  docClass: 'bhaumic' | 'russell',
): string {
  const htmlParts: Array<string> = []

  // Build the header
  const contactParts: Array<string> = []
  if (meta.email) {
    contactParts.push(
      `<a href="mailto:${meta.email}" class="cv-social-link"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>${meta.email}</a>`,
    )
  }
  if (meta.github) {
    contactParts.push(
      `<a href="https://${meta.github}" target="_blank" rel="noopener noreferrer" class="cv-social-link"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>${meta.github}</a>`,
    )
  }
  if (meta.linkedin) {
    contactParts.push(
      `<a href="https://www.${meta.linkedin}" target="_blank" rel="noopener noreferrer" class="cv-social-link"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>${meta.linkedin}</a>`,
    )
  }

  htmlParts.push(`<header class="cv-header">
  <h1 class="cv-name">${meta.firstName} ${meta.lastName}</h1>
  <p class="cv-position">${meta.position}</p>
  <div class="cv-socials">
    ${contactParts.join('\n    ')}
  </div>
</header>`)

  // Determine section command name
  const sectionCmd = docClass === 'bhaumic' ? 'ressection' : 'cvsection'
  const sectionRegex = new RegExp(`\\\\${sectionCmd}\\{([^}]*)\\}`, 'g')
  let sectionMatch: RegExpExecArray | null
  const sections: Array<{ title: string; startIdx: number }> = []

  while ((sectionMatch = sectionRegex.exec(body)) !== null) {
    sections.push({
      title: sectionMatch[1],
      startIdx: sectionMatch.index,
    })
  }

  for (let s = 0; s < sections.length; s++) {
    const section = sections[s]
    const nextStart =
      s + 1 < sections.length ? sections[s + 1].startIdx : body.length
    const sectionContent = body.substring(
      section.startIdx + `\\${sectionCmd}{${section.title}}`.length,
      nextStart,
    )

    const sectionTitle = processInline(section.title)
    let sectionHtml = ''

    // Check for resumesummary (bhaumic)
    const summaryMatch = sectionContent.match(
      /\\begin\{resumesummary\}([\s\S]*?)\\end\{resumesummary\}/,
    )
    if (summaryMatch) {
      sectionHtml = parseSummaryBlock(summaryMatch[1])
    }

    // Check for skilltable (bhaumic) or cvskills (russell)
    const skillsMatch = sectionContent.match(
      /\\begin\{(?:skilltable|cvskills)\}([\s\S]*?)\\end\{(?:skilltable|cvskills)\}/,
    )
    if (skillsMatch) {
      sectionHtml = parseSkillsBlock(skillsMatch[1])
    }

    // Check for expentry (bhaumic)
    if (/\\expentry/.test(sectionContent)) {
      sectionHtml = parseExpEntries(sectionContent)
    }

    // Check for projentry (bhaumic)
    if (/\\projentry/.test(sectionContent)) {
      sectionHtml = parseProjEntries(sectionContent)
    }

    // Check for eduentry (bhaumic)
    if (/\\eduentry/.test(sectionContent)) {
      sectionHtml = parseEduEntries(sectionContent)
    }

    // Check for certrow (bhaumic)
    if (/\\certrow/.test(sectionContent)) {
      sectionHtml = parseCertRowsBlock(sectionContent)
    }

    // Check for cventries (russell)
    const entriesMatch = sectionContent.match(
      /\\begin\{cventries\}([\s\S]*?)\\end\{cventries\}/,
    )
    if (entriesMatch && !sectionHtml) {
      sectionHtml = parseCvEntriesBlock(entriesMatch[1])
    }

    // Check for cvhonors (russell)
    const honorsMatch = sectionContent.match(
      /\\begin\{cvhonors\}([\s\S]*?)\\end\{cvhonors\}/,
    )
    if (honorsMatch && !sectionHtml) {
      sectionHtml = parseCvHonorsBlock(honorsMatch[1])
    }

    htmlParts.push(`<section class="cv-section">
  <h2 class="cv-section-title">${sectionTitle}</h2>
${sectionHtml}
</section>`)
  }

  return htmlParts.join('\n')
}

/**
 * Main entry point: parse a complete LaTeX resume file into HTML + metadata
 * Supports both bhaumic and russell document classes
 */
export function parseLatexResume(latexSource: string): LatexResumeData {
  // Split preamble from body
  const docBegin = latexSource.indexOf('\\begin{document}')
  const docEnd = latexSource.indexOf('\\end{document}')

  const preamble = docBegin !== -1 ? latexSource.substring(0, docBegin) : ''
  const body =
    docBegin !== -1
      ? latexSource.substring(
          docBegin + '\\begin{document}'.length,
          docEnd !== -1 ? docEnd : undefined,
        )
      : latexSource

  const docClass = detectDocumentClass(preamble + body)

  const meta =
    docClass === 'bhaumic'
      ? extractMetadataBhaumic(body)
      : extractMetadataRussell(preamble)

  const html = parseBody(body.trim(), meta, docClass)

  return {
    html: `<div class="cv-document">\n${html}\n</div>`,
    title: `${meta.firstName} ${meta.lastName} — Resume`,
    author: `${meta.firstName} ${meta.lastName}`,
    date: new Date().toISOString(),
    summary: meta.position,
  }
}
