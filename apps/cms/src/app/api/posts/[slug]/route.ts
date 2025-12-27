import { NextResponse } from 'next/server';
import { getSafeSession } from '@/lib/auth-wrapper';
import { getPostBySlug, savePost, deletePost } from '@quicksilver/content-core';
import { validateApiRequest } from '@/lib/api-security';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const post = getPostBySlug(slug);

        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        return NextResponse.json({ post });
    } catch (error) {
        console.error('Fetch post error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const securityError = await validateApiRequest(request);
    if (securityError) return securityError;

    try {
        const session = await getSafeSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug: oldSlug } = await params;
        const body = await request.json();
        const { title, content, published, slug: newSlug } = body;

        const existingPost = getPostBySlug(oldSlug);
        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        // If slug is changing, delete old file
        if (newSlug && newSlug !== oldSlug) {
            deletePost(oldSlug);
        }

        const updatedPost = {
            ...existingPost,
            title: title || existingPost.title,
            content: content || existingPost.content,
            slug: newSlug || oldSlug,
            published: published !== undefined ? published : existingPost.published,
            date: existingPost.date || new Date().toISOString(),
            author: existingPost.author || session.user?.name || session.user?.email || 'Administrator',
        };

        savePost(updatedPost);

        return NextResponse.json({ post: updatedPost });
    } catch (error) {
        console.error('Update post error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const securityError = await validateApiRequest(request);
    if (securityError) return securityError;

    try {
        const session = await getSafeSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { slug } = await params;
        const existingPost = getPostBySlug(slug);

        if (!existingPost) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        deletePost(slug);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete post error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
