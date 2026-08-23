import { describe, expect, it } from 'vitest'

import { toAgentMarkdown } from '@/lib/markdown/toAgentMarkdown'

const SHOWCASE_SNIPPET = `import DemoPipeline from './DemoPipeline'

This draft Note exercises the shared editorial vocabulary.

<Figure width="contained" caption="A contained figure matches the prose measure.">
  <BrowserFrame url="localhost:3000/demo">
    Demo surface for interface walkthroughs.
  </BrowserFrame>
</Figure>
`

describe('toAgentMarkdown', () => {
  it('strips MDX imports and JSX while keeping captions and prose', () => {
    const body = toAgentMarkdown(SHOWCASE_SNIPPET)

    expect(body).toContain('This draft Note exercises the shared editorial vocabulary.')
    expect(body).toContain('A contained figure matches the prose measure.')
    expect(body).toContain('Demo surface for interface walkthroughs.')
    expect(body).not.toContain('import DemoPipeline')
    expect(body).not.toContain('<Figure')
    expect(body).not.toContain('<BrowserFrame')
  })
})
