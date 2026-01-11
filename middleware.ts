import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes to hide for authenticated users (redirect to Resources Hub)
const HIDDEN_ROUTES = [
  '/activity',
  '/browse', 
  '/assignment',
  '/leaderboard',
  '/notifications',
  '/profile',
  '/upload',
  '/web'
]

// Routes that should redirect to login for unauthenticated users
const PROTECTED_ROUTES = [
  '/home'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for authentication cookie/session
  const authCookie = request.cookies.get('openassign_user')
  const isAuthenticated = !!authCookie?.value
  
  // If user is authenticated and trying to access hidden routes, redirect to Resources Hub
  if (isAuthenticated && HIDDEN_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/home', request.url))
  }
  
  // If user is not authenticated and trying to access protected routes, redirect to login
  if (!isAuthenticated && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}
