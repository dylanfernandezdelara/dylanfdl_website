import { NextResponse, type NextRequest } from 'next/server'

import {
  appendVaryAccept,
  MARKDOWN_CONTENT_TYPE,
  NOT_ACCEPTABLE_BODY,
  preferredType,
} from '@/lib/acceptMarkdown'

function rewriteToMarkdown(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = `/api/markdown${pathname === '/' ? '' : pathname}`
  const rewritten = NextResponse.rewrite(url)
  appendVaryAccept(rewritten.headers)
  rewritten.headers.set('Content-Type', MARKDOWN_CONTENT_TYPE)
  return rewritten
}

export function middleware(request: NextRequest): NextResponse | Response {
  const pathname = request.nextUrl.pathname

  if (pathname.includes('.') && !pathname.endsWith('.md')) {
    return NextResponse.next()
  }

  if (pathname.endsWith('.md')) {
    const barePath = pathname.slice(0, -3) || '/'
    return rewriteToMarkdown(request, barePath === '/index' ? '/' : barePath)
  }

  const acceptHeader = request.headers.get('accept')
  const chosen = preferredType(acceptHeader)

  if (chosen === 'text/markdown') {
    return rewriteToMarkdown(request, pathname)
  }

  if (chosen === null && acceptHeader) {
    return new Response(NOT_ACCEPTABLE_BODY, {
      status: 406,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        Vary: 'Accept',
      },
    })
  }

  const response = NextResponse.next()
  appendVaryAccept(response.headers)
  return response
}

export const config = {
  matcher: ['/((?!api/|_next/|_vercel/).*)'],
}
