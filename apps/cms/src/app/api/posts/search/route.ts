import { NextRequest, NextResponse } from 'next/server';
import { getAllPosts } from '@quicksilver/content-core';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q')?.toLowerCase();

        if (!query || query.length < 1) {
            return NextResponse.json([]);
        }

        const allPosts = getAllPosts();

        const filteredPosts = allPosts.filter(post =>
            post.published &&
            (post.title.toLowerCase().includes(query) ||
                post.content.toLowerCase().includes(query))
        ).slice(0, 10);

        const results = filteredPosts.map(post => ({
            id: post.slug,
            title: post.title,
            slug: post.slug,
            excerpt: post.content
                ? post.content.substring(0, 150).replace(/[#*`]/g, '') + '...'
                : '暂无内容',
        }));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
