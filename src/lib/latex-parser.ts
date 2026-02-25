// LaTeX-to-HTML parser for Russell CV class resume rendering
// Converts Russell CV class LaTeX commands into semantic HTML

export interface LatexResumeData {
    html: string
    title: string
    author: string
    date: string
    summary: string
}

/**
 * Extract metadata from the preamble (before \begin{document})
 */
function extractMetadata(preamble: string): {
    firstName: string
    lastName: string
    position: string
    github: string
    linkedin: string
} {
    // \name{\LARGE Bhaumik}{\LARGE Singh}
    // Extract name, stripping any LaTeX font commands like \LARGE, \large, etc.
    const nameMatch = preamble.match(
        /\\name\s*\{([^}]*)\}\s*\{([^}]*)\}/,
    )

    // Strip LaTeX commands from the name parts
    const stripLatexCommands = (s: string) =>
        s.replace(/\\(?:LARGE|Large|large|huge|Huge|normalsize|textbf|textit|bfseries|itshape)\s*/g, '').trim()


    const posMatch = preamble.match(/\\position\{([^}]*)\}/)
    const githubMatch = preamble.match(/\\github\{([^}]*)\}/)
    const linkedinMatch = preamble.match(/\\linkedin\{([^}]*)\}/)

    return {
        firstName: stripLatexCommands(nameMatch?.[1] ?? ''),
        lastName: stripLatexCommands(nameMatch?.[2] ?? ''),
        position: posMatch?.[1]?.replace(/\\&/g, '&') ?? '',
        github: githubMatch?.[1] ?? '',
        linkedin: linkedinMatch?.[1] ?? '',
    }
}

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
function extractBraceGroup(
    text: string,
    pos: number,
): [string, number] {
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
    result = result.replace(/\\(?:LARGE|Large|large|small|tiny|huge|Huge|normalsize|footnotesize|scriptsize)\s*/g, '')

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
 * Parse \begin{cvitems} ... \end{cvitems} into a list
 */
function parseCvItems(content: string): string {
    const items: string[] = []
    const lines = content.split('\n')

    for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed.startsWith('\\item')) {
            let itemText = trimmed.replace(/^\\item\s*/, '')
            // Remove wrapping braces if present
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
 * Parse a single \cvskill{type}{skillset} command
 */
function parseCvSkill(type: string, skillset: string): string {
    return `  <div class="cv-skill-row">
    <span class="cv-skill-type">${processInline(type)}</span>
    <span class="cv-skill-set">${processInline(skillset)}</span>
  </div>`
}

/**
 * Parse a single \cvhonor{position}{title}{issuer}{date} command
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
 * Parse an entire \begin{cvskills}...\end{cvskills} block
 */
function parseCvSkillsBlock(content: string): string {
    const skills: string[] = []
    const regex = /\\cvskill\{/g
    let match: RegExpExecArray | null

    while ((match = regex.exec(content)) !== null) {
        const typeStart = match.index + match[0].length - 1
        const typeEnd = findMatchingBrace(content, typeStart)
        if (typeEnd === -1) continue

        const type = content.substring(typeStart + 1, typeEnd)

        const [skillset, endPos] = extractBraceGroup(content, typeEnd + 1)
        if (endPos === typeEnd + 1) continue

        skills.push(parseCvSkill(type, skillset))
        regex.lastIndex = endPos
    }

    return `<div class="cv-skills">\n${skills.join('\n')}\n</div>`
}

/**
 * Parse an entire \begin{cvhonors}...\end{cvhonors} block
 */
function parseCvHonorsBlock(content: string): string {
    const honors: string[] = []
    const regex = /\\cvhonor\s*\n?\s*\{/g
    let match: RegExpExecArray | null

    while ((match = regex.exec(content)) !== null) {
        // Position (first arg)
        const posStart = content.lastIndexOf('{', match.index + match[0].length - 1)
        const posEnd = findMatchingBrace(content, posStart)
        if (posEnd === -1) continue
        const position = content.substring(posStart + 1, posEnd)

        // Title (second arg)
        const [title, afterTitle] = extractBraceGroup(content, posEnd + 1)

        // Issuer (third arg)
        const [issuer, afterIssuer] = extractBraceGroup(content, afterTitle)

        // Date (fourth arg)
        const [date, afterDate] = extractBraceGroup(content, afterIssuer)

        honors.push(parseCvHonor(position, title, issuer, date))
        regex.lastIndex = afterDate
    }

    return `<div class="cv-honors">\n${honors.join('\n')}\n</div>`
}

/**
 * Parse \begin{cventries}...\end{cventries} block
 */
function parseCvEntriesBlock(content: string): string {
    const entries: string[] = []
    const regex = /\\cventry\s*\n?\s*\{/g
    let match: RegExpExecArray | null

    while ((match = regex.exec(content)) !== null) {
        // Find the start of the full \cventry command
        const entryStart = match.index

        // Extract 5 brace groups
        let pos = content.indexOf('{', entryStart)
        const args: string[] = []

        for (let i = 0; i < 5; i++) {
            // Skip whitespace
            while (pos < content.length && /\s/.test(content[pos]) && content[pos] !== '{') pos++

            if (content[pos] !== '{') {
                // Try to find next brace
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

            // Process cvitems within the description
            let descHtml = ''
            const itemsMatch = description.match(
                /\\begin\{cvitems\}([\s\S]*?)\\end\{cvitems\}/,
            )
            if (itemsMatch) {
                descHtml = parseCvItems(itemsMatch[1])
            }

            const processedTitle = processInline(title)
            const processedPosition = processInline(position)
            const processedLocation = processInline(locationOrDate)
            const processedDate = processInline(typeOrDate)

            entries.push(`  <div class="cv-entry">
    <div class="cv-entry-header">
      <div class="cv-entry-left">
        ${processedTitle ? `<span class="cv-entry-title">${processedTitle}</span>` : ''}
        ${processedPosition ? `<span class="cv-entry-position">${processedPosition}</span>` : ''}
      </div>
      <div class="cv-entry-right">
        ${processedLocation ? `<span class="cv-entry-location">${processedLocation}</span>` : ''}
        ${processedDate ? `<span class="cv-entry-date">${processedDate}</span>` : ''}
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
 * Parse the body of the document
 */
function parseBody(
    body: string,
    meta: {
        firstName: string
        lastName: string
        position: string
        github: string
        linkedin: string
    },
): string {
    const htmlParts: string[] = []

    // Build the header
    htmlParts.push(`<header class="cv-header">
  <h1 class="cv-name">${meta.firstName} ${meta.lastName}</h1>
  <p class="cv-position">${meta.position}</p>
  <div class="cv-socials">
    ${meta.github ? `<a href="https://${meta.github}" target="_blank" rel="noopener noreferrer" class="cv-social-link"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>${meta.github}</a>` : ''}
    ${meta.linkedin ? `<a href="https://www.${meta.linkedin}" target="_blank" rel="noopener noreferrer" class="cv-social-link"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>${meta.linkedin}</a>` : ''}
  </div>
</header>`)

    // Process sections
    const sectionRegex = /\\cvsection\{([^}]*)\}/g
    let sectionMatch: RegExpExecArray | null
    const sections: { title: string; startIdx: number }[] = []

    while ((sectionMatch = sectionRegex.exec(body)) !== null) {
        sections.push({
            title: sectionMatch[1],
            startIdx: sectionMatch.index,
        })
    }

    for (let s = 0; s < sections.length; s++) {
        const section = sections[s]
        const nextStart = s + 1 < sections.length ? sections[s + 1].startIdx : body.length
        const sectionContent = body.substring(
            section.startIdx + `\\cvsection{${section.title}}`.length,
            nextStart,
        )

        const sectionTitle = processInline(section.title)
        let sectionHtml = ''

        // Check for cventries
        const entriesMatch = sectionContent.match(
            /\\begin\{cventries\}([\s\S]*?)\\end\{cventries\}/,
        )
        if (entriesMatch) {
            sectionHtml = parseCvEntriesBlock(entriesMatch[1])
        }

        // Check for cvskills
        const skillsMatch = sectionContent.match(
            /\\begin\{cvskills\}([\s\S]*?)\\end\{cvskills\}/,
        )
        if (skillsMatch) {
            sectionHtml = parseCvSkillsBlock(skillsMatch[1])
        }

        // Check for cvhonors
        const honorsMatch = sectionContent.match(
            /\\begin\{cvhonors\}([\s\S]*?)\\end\{cvhonors\}/,
        )
        if (honorsMatch) {
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
 * Main entry point: parse a complete Russell CV LaTeX file into HTML + metadata
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

    const meta = extractMetadata(preamble)
    const html = parseBody(body.trim(), meta)

    return {
        html: `<div class="cv-document">\n${html}\n</div>`,
        title: `${meta.firstName} ${meta.lastName} — Resume`,
        author: `${meta.firstName} ${meta.lastName}`,
        date: new Date().toISOString(),
        summary: meta.position,
    }
}
