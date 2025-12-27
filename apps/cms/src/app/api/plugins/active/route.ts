import { NextResponse } from 'next/server';

// GET /api/plugins/active - Get all enabled plugins (public endpoint)
// NOTE: This endpoint is deprecated. The new plugin system loads plugins
// directly from the source code registry, not from the database.
export async function GET() {
    try {
        // Return empty array since we're using source-based plugins now
        // This prevents errors in legacy code that might still call this endpoint
        return NextResponse.json([]);
    } catch (error) {
        console.error('Error fetching active plugins:', error);
        return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
    }
}
