'use client'

import { useState, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

type CodeBlockProps = {
  children?: ReactNode
  className?: string
  'data-language'?: string
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node)
  }
  if (Array.isArray(node)) {
    return node.map(extractText).join('')
  }
  if (node && typeof node === 'object' && 'props' in node) {
    const props = node.props as { children?: ReactNode }
    return extractText(props.children)
  }
  return ''
}

export default function CodeBlock({ children, className, ...rest }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const language = rest['data-language']
  const text = extractText(children).replace(/\n$/, '')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="article-code">
      <div className="article-code__toolbar">
        <span className="article-code__lang">{language || 'code'}</span>
        <button
          type="button"
          className={cn('article-code__copy', copied && 'is-copied')}
          onClick={() => {
            void handleCopy()
          }}
        >
          <span className="article-code__copy-label" data-state={copied ? 'copied' : 'idle'}>
            {copied ? 'Copied' : 'Copy'}
          </span>
        </button>
      </div>
      <pre className={cn('article-code__pre', className)} {...rest}>
        {children}
      </pre>
    </div>
  )
}
