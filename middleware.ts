import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase/admin'; // Assumes admin SDK is initialized here

const PROTECTED_ROUTES = ['/dashboard', '/assets', '/staff', '/reports', '/settings'];
const PUBLIC_ROUTES = ['/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  const isProtectedRoute = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!sessionCookie && isProtectedRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (sessionCookie) {
    try {
      // Verify the session cookie with the Firebase Admin SDK.
      // This will throw an error if the cookie is invalid.
      await getAuth(app).verifySessionCookie(sessionCookie, true);

      // If the user is authenticated and tries to access a public route (like login),
      // redirect them to the dashboard.
      if (PUBLIC_ROUTES.includes(pathname)) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error verifying session cookie:', error);
      // If cookie verification fails and it's a protected route, redirect to login.
       if (isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        // Clear the invalid cookie
        url.cookies.delete('session');
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
