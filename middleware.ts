
import { NextResponse, type NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { app } from '@/lib/firebase/admin';

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
      const decodedClaims = await getAuth(app).verifySessionCookie(sessionCookie, true);

      if (decodedClaims.role !== 'admin') {
         const url = request.nextUrl.clone();
         url.pathname = '/login';
         url.searchParams.set('error', 'unauthorized');
         // Important: Clear the invalid session cookie
         const response = NextResponse.redirect(url);
         response.cookies.delete('session');
         return response;
      }
      
      if (PUBLIC_ROUTES.includes(pathname)) {
          const url = request.nextUrl.clone();
          url.pathname = '/dashboard';
          return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error('Error verifying session cookie:', error);
       if (isProtectedRoute) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        // Important: Clear the invalid session cookie
        const response = NextResponse.redirect(url);
        response.cookies.delete('session');
        return response;
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
