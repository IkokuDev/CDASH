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
      // We will need to implement session management with cookies
      // For now, let's assume if a cookie exists, the user is "logged in" for middleware purposes
      // A proper implementation would verify the cookie with Firebase Admin SDK
    } catch (error) {
       if (isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
      }
    }
    
    if (PUBLIC_ROUTES.includes(pathname)) {
        const url = request.nextUrl.clone();
        url.pathname = '/dashboard';
        return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
