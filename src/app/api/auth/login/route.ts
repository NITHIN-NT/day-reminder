import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function POST(request: Request) {
    const { password } = await request.json();
    const validHashedPassword = process.env.HASHPWD;

    if (!validHashedPassword) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Simple SHA-256 for this single-user case, or use bcrypt if available
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    if (hashedPassword === validHashedPassword) {
        const response = NextResponse.json({ success: true });

        // Set a session cookie
        response.cookies.set('session_id', 'authenticated', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/',
        });

        return response;
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
