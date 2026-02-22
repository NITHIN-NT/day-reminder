import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const session = request.cookies.get('session_id');
    const { pathname } = request.nextUrl;

    // Allow access to login, api/auth, and manifest/icons
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/auth') ||
        pathname === '/manifest.json' ||
        pathname === '/app_icon.png' ||
        pathname.startsWith('/_next')
    ) {
        return NextResponse.next();
    }

    // Redirect to login if no session
    if (!session) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
