import { NextResponse, type NextRequest } from 'next/server'

import {
  NOT_ACCEPTABLE_BODY,
  appendVaryAccept,
  negotiateDocument,
} from '@/lib/acceptMarkdown'

function rewriteToMarkdown(request: NextRequest, pathname: string): NextResponse {
  const url = request.nextUrl.clone()
  url.pathname = `/api/markdown${pathname === '/' ? '' : pathname}`
  const rewritten = NextResponse.rewrite(url)
  appendVaryAccept(rewritten.headers)
  return rewritten
}

export function middleware(request: NextRequest): NextResponse | Response {
  const decision = negotiateDocument(request)

  switch (decision.kind) {
    case 'skip':
      return NextResponse.next()
    case 'markdown':
      return rewriteToMarkdown(request, decision.pathname)
    case 'not-acceptable':
      return new Response(NOT_ACCEPTABLE_BODY, {
        status: 406,
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          Vary: 'Accept',
        },
      })
    case 'html': {
      const response = NextResponse.next()
      appendVaryAccept(response.headers)
      return response
    }
    default: {
      const _exhaustive: never = decision
      return _exhaustive
    }
  }
}

export const config = {
  matcher: ['/((?!api/|_next/|_vercel/).*)'],
}
