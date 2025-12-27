import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSafeSession } from '@/lib/auth-wrapper';

interface RouteParams {
    params: Promise<{ id: string }>;
}

// GET /api/plugins/[id] - Get a single plugin
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await getSafeSession();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const plugin = await prisma.plugin.findUnique({
            where: { id },
        });

        if (!plugin) {
            return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
        }

        // Check ownership
        if (plugin.authorId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(plugin);
    } catch (error) {
        console.error('Error fetching plugin:', error);
        return NextResponse.json({ error: 'Failed to fetch plugin' }, { status: 500 });
    }
}

import { validateApiRequest } from '@/lib/api-security';

// ... (existing imports)

// ...

// PUT /api/plugins/[id] - Update a plugin
export async function PUT(request: Request, { params }: RouteParams) {
    const securityError = await validateApiRequest(request);
    if (securityError) return securityError;

    try {
        const { id } = await params;
        const session = await getSafeSession();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const plugin = await prisma.plugin.findUnique({
            where: { id },
        });

        if (!plugin) {
            return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
        }

        if (plugin.authorId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { name, slug, description, type, code, styles, config, enabled, priority } = body;

        // Check if new slug already exists (if changed)
        if (slug && slug !== plugin.slug) {
            const existing = await prisma.plugin.findUnique({ where: { slug } });
            if (existing) {
                return NextResponse.json({ error: 'Plugin with this slug already exists' }, { status: 400 });
            }
        }

        const updatedPlugin = await prisma.plugin.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(slug !== undefined && { slug }),
                ...(description !== undefined && { description }),
                ...(type !== undefined && { type }),
                ...(code !== undefined && { code }),
                ...(styles !== undefined && { styles }),
                ...(config !== undefined && { config }),
                ...(enabled !== undefined && { enabled }),
                ...(priority !== undefined && { priority }),
            },
        });

        return NextResponse.json(updatedPlugin);
    } catch (error) {
        console.error('Error updating plugin:', error);
        return NextResponse.json({ error: 'Failed to update plugin' }, { status: 500 });
    }
}

// DELETE /api/plugins/[id] - Delete a plugin
export async function DELETE(request: Request, { params }: RouteParams) {
    const securityError = await validateApiRequest(request);
    if (securityError) return securityError;

    try {
        const { id } = await params;
        const session = await getSafeSession();
        if (!session || !session.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const plugin = await prisma.plugin.findUnique({
            where: { id },
        });

        if (!plugin) {
            return NextResponse.json({ error: 'Plugin not found' }, { status: 404 });
        }

        if (plugin.authorId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.plugin.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting plugin:', error);
        return NextResponse.json({ error: 'Failed to delete plugin' }, { status: 500 });
    }
}
