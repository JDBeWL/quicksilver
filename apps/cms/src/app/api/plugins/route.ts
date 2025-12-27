import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSafeSession } from '@/lib/auth-wrapper';

// GET /api/plugins - Get all plugins for current user
export async function GET() {
    try {
        const session = await getSafeSession();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const plugins = await prisma.plugin.findMany({
            where: { authorId: session.user.id },
            orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
        });

        return NextResponse.json(plugins);
    } catch (error) {
        console.error('Error fetching plugins:', error);
        return NextResponse.json({ error: 'Failed to fetch plugins' }, { status: 500 });
    }
}

// POST /api/plugins - Create a new plugin
export async function POST(request: Request) {
    try {
        const session = await getSafeSession();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { name, slug, description, type, code, styles, config, enabled, priority } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        // Check if slug already exists
        const existing = await prisma.plugin.findUnique({ where: { slug } });
        if (existing) {
            return NextResponse.json({ error: 'Plugin with this slug already exists' }, { status: 400 });
        }

        const plugin = await prisma.plugin.create({
            data: {
                name,
                slug,
                description: description || null,
                type: type || 'theme',
                code: code || null,
                styles: styles || null,
                config: config || null,
                enabled: enabled ?? false,
                priority: priority ?? 0,
                authorId: session.user.id as string,
            },
        });

        return NextResponse.json(plugin, { status: 201 });
    } catch (error) {
        console.error('Error creating plugin:', error);
        return NextResponse.json({ error: 'Failed to create plugin' }, { status: 500 });
    }
}
