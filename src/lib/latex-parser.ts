// LaTeX-to-HTML parser for resume rendering
// Converts a subset of LaTeX commands into semantic HTML

export interface LatexResumeData {
    html: string
    title: string
    author: string
    date: string
    summary: string
}

/**
 * Parse LaTeX metadata from the preamble (before \begin{document})
 */
function extractMetadata(preamble: string): {
    title: string
    author: string
    date: string
    summary: string
} {
    const titleMatch = preamble.match(/\\title\{([^}]*)\}/)
    const authorMatch = preamble.match(/\\author\{([^}]*)\}/)
    const dateMatch = preamble.match(/\\date\{([^}]*)\}/)
    const summaryMatch = preamble.match(/%\s*summary:\s*(.+)/)

    return {
        title: titleMatch?.[1] ?? 'Resume',
        author: authorMatch?.[1] ?? '',
        date: dateMatch?.[1] ?? new Date().toISOString().split('T')[0],
        summary: summaryMatch?.[1]?.trim() ?? '',
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
 * Process a LaTeX command with balanced braces
 * e.g., \textbf{some text with {nested} braces} → <strong>some text with {nested} braces</strong>
 */
function processCommand(
    text: string,
    command: string,
    htmlTag: string,
): string {
    const pattern = `\\${command}{`
    let result = text
    let startIdx = result.indexOf(pattern)

    while (startIdx !== -1) {
        const braceStart = startIdx + pattern.length - 1
        const braceEnd = findMatchingBrace(result, braceStart)

        if (braceEnd === -1) break

        const inner = result.substring(braceStart + 1, braceEnd)
        const before = result.substring(0, startIdx)
        const after = result.substring(braceEnd + 1)

        result = `${before}<${htmlTag}>${inner}</${htmlTag}>${after}`
        startIdx = result.indexOf(pattern)
    }

    return result
}

/**
 * Process \href{url}{text} commands
 */
function processHref(text: string): string {
    const pattern = '\\href{'
    let result = text
    let startIdx = result.indexOf(pattern)

    while (startIdx !== -1) {
        // Find the URL brace pair
        const urlBraceStart = startIdx + pattern.length - 1
        const urlBraceEnd = findMatchingBrace(result, urlBraceStart)

        if (urlBraceEnd === -1) break

        const url = result.substring(urlBraceStart + 1, urlBraceEnd)

        // Find the text brace pair (immediately follows)
        const textBraceStart = result.indexOf('{', urlBraceEnd + 1)
        if (textBraceStart === -1 || textBraceStart > urlBraceEnd + 2) break

        const textBraceEnd = findMatchingBrace(result, textBraceStart)
        if (textBraceEnd === -1) break

        const linkText = result.substring(textBraceStart + 1, textBraceEnd)
        const before = result.substring(0, startIdx)
        const after = result.substring(textBraceEnd + 1)

        result = `${before}<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText}</a>${after}`
        startIdx = result.indexOf(pattern)
    }

    return result
}

/**
 * Process inline LaTeX commands into HTML
 */
function processInline(text: string): string {
    let result = text

    // Escape HTML entities first
    result = result.replace(/</g, '&lt;').replace(/>/g, '&gt;')

    // \href{url}{text} → <a> (do this before other commands that might be inside link text)
    result = processHref(result)

    // \textbf{...} → <strong>...</strong>
    result = processCommand(result, 'textbf', 'strong')

    // \textit{...} → <em>...</em>
    result = processCommand(result, 'textit', 'em')

    // \texttt{...} → <code>...</code>
    result = processCommand(result, 'texttt', 'code')

    // \underline{...} → <u>...</u>
    result = processCommand(result, 'underline', 'u')

    // Font size commands: {\LARGE ...}, {\large ...}, {\small ...}
    // These use a grouped syntax: {\LARGE text}
    result = result.replace(
        /\{\\LARGE\s+([^}]*)\}/g,
        '<span class="latex-huge">$1</span>',
    )
    result = result.replace(
        /\{\\Large\s+([^}]*)\}/g,
        '<span class="latex-large-x">$1</span>',
    )
    result = result.replace(
        /\{\\large\s+([^}]*)\}/g,
        '<span class="latex-large">$1</span>',
    )
    result = result.replace(
        /\{\\small\s+([^}]*)\}/g,
        '<span class="latex-small">$1</span>',
    )

    // \hfill → flexible spacer
    result = result.replace(/\\hfill/g, '<span class="latex-hfill"></span>')

    // LaTeX special characters  (order matters: \\ before \&, etc.)
    // \\[0.3em] → vertical spacing div
    result = result.replace(
        /\\\\\[([^\]]*)\]/g,
        '<div class="latex-vspace-inline" style="height: $1"></div>',
    )
    // \\ → line break
    result = result.replace(/\\\\/g, '<br/>')
    // \& → &
    result = result.replace(/\\&/g, '&amp;')
    // \% → %
    result = result.replace(/\\%/g, '%')
    // \_ → _
    result = result.replace(/\\_/g, '_')
    // \# → #
    result = result.replace(/\\#/g, '#')
    // \~ → non-breaking space
    result = result.replace(/\\~/g, '&nbsp;')
    // ~ → non-breaking space
    result = result.replace(/~/g, '&nbsp;')

    // \quad → space, \qquad → double space
    result = result.replace(/\\quad/g, '<span class="latex-quad"></span>')
    result = result.replace(/\\qquad/g, '<span class="latex-qquad"></span>')

    // \, → thin space
    result = result.replace(/\\,/g, '&thinsp;')

    // em-dash and en-dash (triple/double hyphens)
    result = result.replace(/---/g, '&mdash;')
    result = result.replace(/--/g, '&ndash;')

    // Clean up escaped brackets
    result = result.replace(/\\\[/g, '[')
    result = result.replace(/\\\]/g, ']')

    return result
}

/**
 * Parse \begin{itemize} content into an HTML <ul>
 */
function parseItemize(
    lines: string[],
    startIdx: number,
): { html: string; endIndex: number } {
    const items: string[] = []
    let currentItem = ''
    let i = startIdx

    while (i < lines.length) {
        const line = lines[i].trim()

        if (line === '\\end{itemize}') {
            if (currentItem) {
                items.push(currentItem)
            }
            break
        }

        // Nested itemize
        if (line === '\\begin{itemize}') {
            const nested = parseItemize(lines, i + 1)
            currentItem += nested.html
            i = nested.endIndex + 1
            continue
        }

        if (line.startsWith('\\item')) {
            if (currentItem) {
                items.push(currentItem)
            }
            currentItem = line.replace(/^\\item\s*/, '')
            i++
            continue
        }

        // Continuation of current item
        if (currentItem && line) {
            currentItem += ' ' + line
        }
        i++
    }

    const listItems = items
        .map((item) => `  <li>${processInline(item)}</li>`)
        .join('\n')
    return {
        html: `<ul class="latex-itemize">\n${listItems}\n</ul>`,
        endIndex: i,
    }
}

/**
 * Parse \begin{enumerate} content into an HTML <ol>
 */
function parseEnumerate(
    lines: string[],
    startIdx: number,
): { html: string; endIndex: number } {
    const items: string[] = []
    let currentItem = ''
    let i = startIdx

    while (i < lines.length) {
        const line = lines[i].trim()

        if (line === '\\end{enumerate}') {
            if (currentItem) {
                items.push(currentItem)
            }
            break
        }

        if (line.startsWith('\\item')) {
            if (currentItem) {
                items.push(currentItem)
            }
            currentItem = line.replace(/^\\item\s*/, '')
            i++
            continue
        }

        if (currentItem && line) {
            currentItem += ' ' + line
        }
        i++
    }

    const listItems = items
        .map((item) => `  <li>${processInline(item)}</li>`)
        .join('\n')
    return {
        html: `<ol class="latex-enumerate">\n${listItems}\n</ol>`,
        endIndex: i,
    }
}

/**
 * Parse the body of the LaTeX document into HTML
 */
function parseBody(body: string): string {
    const lines = body.split('\n')
    const htmlParts: string[] = []
    let i = 0
    let inCenter = false

    while (i < lines.length) {
        const line = lines[i].trim()

        // Skip empty lines
        if (line === '') {
            i++
            continue
        }

        // Skip comment lines
        if (line.startsWith('%')) {
            i++
            continue
        }

        // \begin{center} ... \end{center}
        if (line === '\\begin{center}') {
            inCenter = true
            htmlParts.push('<div class="latex-center">')
            i++
            continue
        }
        if (line === '\\end{center}') {
            inCenter = false
            htmlParts.push('</div>')
            i++
            continue
        }

        // \section{...}
        const sectionMatch = line.match(/^\\section\{(.+)\}$/)
        if (sectionMatch) {
            const sectionTitle = processInline(sectionMatch[1])
            htmlParts.push(
                `<h2 class="latex-section"><span class="latex-section-title">${sectionTitle}</span></h2>`,
            )
            i++
            continue
        }

        // \subsection{...}
        const subsectionMatch = line.match(/^\\subsection\{(.+)\}$/)
        if (subsectionMatch) {
            const title = processInline(subsectionMatch[1])
            htmlParts.push(
                `<h3 class="latex-subsection"><span class="latex-subsection-title">${title}</span></h3>`,
            )
            i++
            continue
        }

        // \begin{itemize} ... \end{itemize}
        if (line === '\\begin{itemize}') {
            const { html: listHtml, endIndex } = parseItemize(lines, i + 1)
            htmlParts.push(listHtml)
            i = endIndex + 1
            continue
        }

        // \begin{enumerate} ... \end{enumerate}
        if (line === '\\begin{enumerate}') {
            const { html: listHtml, endIndex } = parseEnumerate(lines, i + 1)
            htmlParts.push(listHtml)
            i = endIndex + 1
            continue
        }

        // \vspace{...} or \bigskip, \medskip, \smallskip
        const vspaceMatch = line.match(/^\\vspace\{(.+)\}$/)
        if (vspaceMatch) {
            htmlParts.push(
                `<div class="latex-vspace" style="height: ${vspaceMatch[1]}"></div>`,
            )
            i++
            continue
        }
        if (line === '\\bigskip') {
            htmlParts.push('<div class="latex-vspace" style="height: 1em"></div>')
            i++
            continue
        }
        if (line === '\\medskip') {
            htmlParts.push('<div class="latex-vspace" style="height: 0.5em"></div>')
            i++
            continue
        }
        if (line === '\\smallskip') {
            htmlParts.push('<div class="latex-vspace" style="height: 0.25em"></div>')
            i++
            continue
        }

        // \hrule or \rule{...}{...}
        if (line === '\\hrule' || line.match(/^\\rule\{/)) {
            htmlParts.push('<hr class="latex-hrule" />')
            i++
            continue
        }

        // Skip known no-op commands
        if (
            line.match(/^\\(maketitle|newpage|clearpage|pagebreak|noindent)/) ||
            line.match(/^\\(centering)/)
        ) {
            i++
            continue
        }

        // Regular text line — wrap in paragraph or centered content
        if (inCenter) {
            htmlParts.push(`<div class="latex-center-line">${processInline(line)}</div>`)
        } else {
            htmlParts.push(`<p class="latex-paragraph">${processInline(line)}</p>`)
        }

        i++
    }

    return htmlParts.join('\n')
}

/**
 * Main entry point: parse a complete LaTeX file into HTML + metadata
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

    const metadata = extractMetadata(preamble)
    const html = parseBody(body.trim())

    return {
        html: `<div class="latex-document">\n${html}\n</div>`,
        title: metadata.title,
        author: metadata.author,
        date: new Date(metadata.date).toISOString(),
        summary: metadata.summary,
    }
}
