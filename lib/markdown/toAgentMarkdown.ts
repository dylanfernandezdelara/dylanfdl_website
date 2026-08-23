/**
 * Turn MDX source into agent-facing Markdown: drop import/export lines and
 * JSX islands, keep captions and remaining prose.
 */
export function toAgentMarkdown(source: string): string {
  const withoutModuleLines = source
    .split('\n')
    .filter((line) => !/^\s*(?:import|export)\b/.test(line))
    .join('\n')

  const withoutJsx = withoutModuleLines
    .replace(/<([A-Z][A-Za-z0-9.]*)\b([^>]*)>([\s\S]*?)<\/\1>/g, (_match, _name, attrs: string, inner: string) => {
      const caption = /\bcaption="([^"]*)"/.exec(attrs)?.[1]
      const innerText = inner.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      return [caption, innerText].filter(Boolean).join('\n\n')
    })
    .replace(/<([A-Z][A-Za-z0-9.]*)\b[^>]*\/>/g, '')

  return withoutJsx.replace(/\n{3,}/g, '\n\n').trim()
}
