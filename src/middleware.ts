
import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase/admin';

const PROTECTED_ROUTES = ['/dashboard', '/assets', '/staff', '/reports', '/settings'];
const PUBLIC_ROUTES = ['/login', '/join', '/create-organization'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // If accessing a public route, let them through.
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // If no session cookie and trying to access a protected route, redirect to login.
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // If there is a session cookie, verify it.
  if (sessionCookie) {
    try {
      const decodedToken = await getAuth(app).verifySessionCookie(sessionCookie, true);
      const { organizationId } = decodedToken;

      // If user is authenticated and part of an organization, allow access.
      if (organizationId) {
        return NextResponse.next();
      } else {
        // If user is authenticated but NOT part of an organization,
        // and trying to access a protected route, redirect them to the join page.
        if (isProtectedRoute) {
            const joinUrl = new URL('/join', request.url)
            joinUrl.searchParams.set('info', 'no-organization');
            return NextResponse.redirect(joinUrl);
        }
      }
    } catch (error) {
      console.error('Error verifying session cookie:', error);
      // Invalid cookie, clear it and redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
