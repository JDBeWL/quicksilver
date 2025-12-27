import { NextResponse } from 'next/server';
import { getSafeSession } from '@/lib/auth-wrapper';
import { savePost, getAllPosts } from '@quicksilver/content-core';

export async function GET(request: Request) {
    try {
        const posts = getAllPosts();
        return NextResponse.json({ posts });
    } catch (error) {
        console.error('Fetch posts error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getSafeSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, content, published, slug } = body;

        if (!title || !slug) {
            return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 });
        }

        // Check if file already exists
        const posts = getAllPosts();
        if (posts.some(p => p.slug === slug)) {
            return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
        }

        const newPost = {
            title,
            content: content || '',
            slug,
            published: published || false,
            date: new Date().toISOString(),
            author: session.user?.name || session.user?.email || 'Administrator',
        };

        savePost(newPost);

        return NextResponse.json({ post: newPost });
    } catch (error) {
        console.error('Create post error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
