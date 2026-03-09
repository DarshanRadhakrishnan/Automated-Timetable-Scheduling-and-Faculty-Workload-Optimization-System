import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that DO NOT require authentication
const PUBLIC_PATHS = ['/login', '/signup', '/(auth)'];

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (isPublic) return NextResponse.next();

    // Check for token in cookies (set during login)
    const token = request.cookies.get('token')?.value;

    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    // Run only on admin routes
    matcher: ['/(admin)/:path*', '/timetable/:path*', '/analytics/:path*'],
};
