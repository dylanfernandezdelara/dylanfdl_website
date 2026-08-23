import { NextResponse, type NextRequest } from 'next/server'

import {
  appendVaryAccept,
  isDocumentNegotiation,
  NOT_ACCEPTABLE_BODY,
  preferredType,
  shouldNegotiate,
} from '@/lib/acceptMarkdown'

function rewriteToMarkdown(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = `/api/markdown${pathname === '/' ? '' : pathname}`
  const rewritten = NextResponse.rewrite(url)
  appendVaryAccept(rewritten.headers)
  return rewritten
}

export function middleware(request: NextRequest): NextResponse | Response {
  const pathname = request.nextUrl.pathname

  if (pathname.includes('.') && !pathname.endsWith('.md')) {
    return NextResponse.next()
  }

  if (pathname.endsWith('.md')) {
    if (!shouldNegotiate(request)) {
      return NextResponse.next()
    }
    const barePath = pathname.slice(0, -3) || '/'
    return rewriteToMarkdown(request, barePath === '/index' ? '/' : barePath)
  }

  if (!shouldNegotiate(request)) {
    return NextResponse.next()
  }

  const acceptHeader = request.headers.get('accept')
  const chosen = preferredType(acceptHeader)

  if (chosen === 'text/markdown') {
    return rewriteToMarkdown(request, pathname)
  }

  if (chosen === null && isDocumentNegotiation(acceptHeader)) {
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
