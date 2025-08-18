
import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase/admin';

const PROTECTED_ROUTES = ['/dashboard', '/assets', '/staff', '/reports', '/settings'];
const PUBLIC_ROUTES = ['/login', '/join'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!sessionCookie) {
    if (isProtectedRoute) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  try {
    const decodedToken = await getAuth(app).verifySessionCookie(sessionCookie, true);
    const { organizationId } = decodedToken;

    if (organizationId) {
        // User is part of an organization, allow access to protected routes
        if (isPublicRoute && pathname !== '/join') {
            return NextResponse.redirect(new URL('/dashboard', request.url));
        }
        return NextResponse.next();
    } else {
        // User is authenticated but not part of an organization
        if (pathname === '/join') {
            return NextResponse.next();
        } else {
            return NextResponse.redirect(new URL('/join', request.url));
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

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
