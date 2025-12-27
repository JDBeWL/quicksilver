
import { NextResponse } from 'next/server';

export async function validateApiRequest(request: Request) {
    const method = request.method;

    // 1. Validate Content-Type for state-changing methods
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const contentType = request.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            return NextResponse.json(
                { error: 'Invalid Content-Type. Expected application/json.' },
                { status: 415 }
            );
        }
    }

    // 2. Validate Origin/Referer to prevent CSRF
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const host = request.headers.get('host'); // e.g. localhost:3000

    if (!host) {
        // Should rarely happen in HTTP/1.1+
        return NextResponse.json({ error: 'Missing Host header' }, { status: 400 });
    }

    // Allow requests with no Origin/Referer if it's GET (though CSRF is rare for GET, checking Referer adds defense in depth if needed, but usually we just care about state changes)
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        // If neither is present, it might be a direct API call (e.g. curl) or privacy tool.
        // For strict CSRF protection on browser clients, we usually expect at least one.
        // But for flexibility, we might just check: IF they exist, they must match Host.
        // To be STRICT as requested:
        if (!origin && !referer) {
            // Optional: allow if server-to-server or curl?
            // For this task, we want "CSRF protection", which mainly implies browser.
            // Browsers always send Origin or Referer.
            return NextResponse.json({ error: 'Missing Origin or Referer header' }, { status: 403 });
        }

        if (origin) {
            const originUrl = new URL(origin);
            if (originUrl.host !== host) {
                return NextResponse.json({ error: 'Invalid Origin' }, { status: 403 });
            }
        } else if (referer) {
            const refererUrl = new URL(referer);
            if (refererUrl.host !== host) {
                return NextResponse.json({ error: 'Invalid Referer' }, { status: 403 });
            }
        }
    }

    return null; // OK
}
