import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './i18n-config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';
import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Simple in-memory store for rate limiting
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute

function getLocale(request: NextRequest): string | undefined {
    const negotiatorHeaders: Record<string, string> = {};
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));

    const locales: string[] = i18n.locales as unknown as string[];
    let languages = new Negotiator({ headers: negotiatorHeaders }).languages(locales);

    return matchLocale(languages, locales, i18n.defaultLocale);
}

const { auth } = NextAuth(authConfig);

export default auth(async function proxy(req) {
    const request = req as unknown as NextRequest; // Cast to NextRequest for compatibility
    const pathname = request.nextUrl.pathname;

    // 1. Rate Limiting for Auth Routes
    // Note: This logic must run before redirects if we want to limit registration API calls
    if (pathname.startsWith('/api/auth')) {
        const ip = request.headers.get('x-forwarded-for') || 'unknown';
        const now = Date.now();

        let record = rateLimitMap.get(ip);

        // Reset if window passed
        if (!record || (now - record.lastReset > WINDOW_MS)) {
            record = { count: 0, lastReset: now };
        }

        if (record.count >= MAX_REQUESTS) {
            return new NextResponse(
                JSON.stringify({ error: 'Too many requests, please try again later.' }),
                { status: 429, headers: { 'Content-Type': 'application/json' } }
            );
        }

        record.count += 1;
        rateLimitMap.set(ip, record);
    }

    // 2. Internationalization Logic
    // Ignore api routes for i18n redirection
    if (pathname.startsWith('/api') || pathname.startsWith('/_next') || pathname.includes('.')) {
        return NextResponse.next();
    }

    const pathnameIsMissingLocale = i18n.locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    );

    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);
        const response = NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
                request.url
            )
        );
        // 添加缓存控制头，防止浏览器缓存重定向
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        response.headers.set('Surrogate-Control', 'no-store');
        return response;
    }

    return NextResponse.next();
});

export const config = {
    // Matcher: Match everything except static files and next internals
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};