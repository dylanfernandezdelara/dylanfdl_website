import { describe, expect, it } from 'vitest'
import { computeSearchResults, dedupeStructuralTargets, type SearchTarget } from '../lib/page-search'

type MockNode = {
  id: string
  ancestors: string[]
}

const mockTargets: SearchTarget<MockNode>[] = [
  {
    id: 'parent',
    text: 'Wearables Core OS',
    textLower: 'wearables core os',
    element: { id: 'parent', ancestors: [] },
    order: 0,
  },
  {
    id: 'child',
    text: 'Wearables Core OS',
    textLower: 'wearables core os',
    element: { id: 'child', ancestors: ['parent'] },
    order: 1,
  },
  {
    id: 'other',
    text: 'Different text',
    textLower: 'different text',
    element: { id: 'other', ancestors: [] },
    order: 2,
  },
]

const isAncestor = (possibleAncestor: MockNode, possibleDescendant: MockNode) =>
  possibleDescendant.ancestors.includes(possibleAncestor.id)

describe('dedupeStructuralTargets', () => {
  it('keeps the deeper descendant node for identical parent/child text', () => {
    const deduped = dedupeStructuralTargets(mockTargets, isAncestor)

    expect(deduped.map((target) => target.id)).toEqual(['child', 'other'])
  })
})

describe('computeSearchResults', () => {
  it('dedupes exact repeated text and ranks by match index then length then order', () => {
    const targets: SearchTarget<MockNode>[] = [
      {
        id: 'alpha',
        text: 'alpha query z',
        textLower: 'alpha query z',
        element: { id: 'alpha', ancestors: [] },
        order: 0,
      },
      {
        id: 'short-late',
        text: 'query',
        textLower: 'query',
        element: { id: 'short-late', ancestors: [] },
        order: 5,
      },
      {
        id: 'short-early',
        text: 'query',
        textLower: 'query',
        element: { id: 'short-early', ancestors: [] },
        order: 1,
      },
      {
        id: 'long',
        text: 'query long text',
        textLower: 'query long text',
        element: { id: 'long', ancestors: [] },
        order: 2,
      },
    ]

    const results = computeSearchResults('query', targets, 24)

    expect(results.map((result) => result.id)).toEqual(['short-early', 'long', 'alpha'])
  })

  it('applies the result limit after dedupe', () => {
    const targets: SearchTarget<MockNode>[] = Array.from({ length: 30 }, (_, index) => ({
      id: `id-${index}`,
      text: `query ${index}`,
      textLower: `query ${index}`,
      element: { id: `node-${index}`, ancestors: [] },
      order: index,
    }))

    const results = computeSearchResults('query', targets, 24)
    expect(results).toHaveLength(24)
  })
})
