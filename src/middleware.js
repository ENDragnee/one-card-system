import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Define public routes that don't require authentication
const publicRoutes = ['/landing', '/auth/signin', '/auth/signup', '/onboarding', '/privacy-policy', '/terms-of-service'];

export async function middleware(request) {
  const token = await getToken({ req: request }).catch(() => null);
  const { pathname } = request.nextUrl;

  const isPublicRoute = publicRoutes.includes(pathname);

  // Public routes: Authenticated users are redirected to /dashboard
  if (isPublicRoute) {
    if (token) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // Protected routes: Unauthenticated users are redirected to /auth/signin
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow access to authenticated users
  return NextResponse.next();
}

// Configure route matching
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
