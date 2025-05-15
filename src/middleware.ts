// middleware.ts
import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';
import { Role } from '@prisma/client'; // Make sure Prisma types are available here

// Path to your login page (where LoginPage component is rendered)
const LOGIN_PAGE_PATH = '/onboarding';

// General public routes accessible by anyone (authenticated or not)
// Excludes login page for authenticated users, as they'll be redirected.
const GENERAL_PUBLIC_ROUTES = ['/landing', '/privacy-policy', '/terms-of-service', '/auth/signup']; // Add /auth/signup if you have it

// Routes students can access when logged in (includes their main page and general public ones)
const STUDENT_ACCESSIBLE_LOGGED_IN_ROUTES = [LOGIN_PAGE_PATH, ...GENERAL_PUBLIC_ROUTES, '/']; // Allow root '/'


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // getToken requires the secret to be explicitly passed in middleware
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const userRole = token?.role as Role | undefined;

  // 1. User is authenticated
  if (token && userRole) {
    // 1a. Authenticated user tries to access the LOGIN_PAGE_PATH
    if (pathname === LOGIN_PAGE_PATH) {
      if (userRole === Role.Student) {
        // Student is on their designated page (/onboarding), allow to see content
        return NextResponse.next();
      } else if (userRole === Role.Registrar) {
        // Registrar on login page, redirect to their dashboard
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      // Fallback for other authenticated roles on login page
      return NextResponse.redirect(new URL('/', request.url));
    }

    // 1b. Role-specific routing for Student
    if (userRole === Role.Student) {
      // Redirect student from /dashboard to their onboarding page
      if (pathname === '/admin/dashboard') {
        return NextResponse.redirect(new URL(LOGIN_PAGE_PATH, request.url));
      }
      
      // Check if the student is trying to access a route not allowed for them.
      // A route is allowed if it starts with any of the paths in STUDENT_ACCESSIBLE_LOGGED_IN_ROUTES.
      const isAllowedForStudent = STUDENT_ACCESSIBLE_LOGGED_IN_ROUTES.some(route => pathname.startsWith(route));
      
      if (!isAllowedForStudent) {
         // If not an allowed route, redirect to their main page (/onboarding)
         return NextResponse.redirect(new URL(LOGIN_PAGE_PATH, request.url));
      }
    }
    // 1c. Role-specific routing for Registrar
    else if (userRole === Role.Registrar) {
      // Registrars can access /dashboard.
      // If they try to access student-only content areas (e.g. if /onboarding was *only* for student content
      // and not also the login page), they are already redirected from LOGIN_PAGE_PATH.
      // They are generally allowed to access other protected routes.
    }
    
    // If none of the specific redirection rules for authenticated users apply, allow access
    return NextResponse.next();
  }

  // 2. User is NOT authenticated
  // Allow access to general public routes and the login page itself
  const isGeneralPublicRoute = GENERAL_PUBLIC_ROUTES.includes(pathname);

  if (isGeneralPublicRoute || pathname === LOGIN_PAGE_PATH) {
    return NextResponse.next(); // Allow access
  }

  // For all other routes, if user is not authenticated, redirect to login
  const signInUrl = new URL(LOGIN_PAGE_PATH, request.url);
  signInUrl.searchParams.set('callbackUrl', pathname); // Preserve intended destination
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: [
    // Match all routes except for API routes, static files, image optimization files, and files in /public
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};