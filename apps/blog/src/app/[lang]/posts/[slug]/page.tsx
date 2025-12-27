import Link from 'next/link';
import { notFound } from 'next/navigation';
import 'highlight.js/styles/github-dark.css';
import { MDXContent } from '../../../../components/mdx-content';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarFallback } from '../../../../components/ui/avatar';
import { Button } from '../../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Locale } from '../../../../i18n-config';
import { getDictionary } from '../../../../get-dictionary';
import { PluginSlot } from '../../../../components/PluginSlot';
import { getPostBySlug, getAllPosts } from '@quicksilver/content-core';

export const dynamicParams = false;

export async function generateStaticParams() {
    const posts = getAllPosts();
    const langs: Locale[] = ['en', 'zh']; // Supported locales

    return langs.flatMap((lang) =>
        posts.map((post: any) => ({
            lang,
            slug: post.slug,
        }))
    );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string; lang: Locale }> }) {
    const { slug, lang } = await params;
    const dict = await getDictionary(lang);
    const post = getPostBySlug(slug);

    if (!post || !post.published) {
        notFound();
    }

    // Date locale handling
    const { enUS, zhCN } = require('date-fns/locale');
    const localeMap: Record<string, any> = { 'en': enUS, 'zh': zhCN };
    const dateLocale = localeMap[lang] || enUS;

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Editorial Header */}
            <div className="w-full pt-12 pb-12 md:pt-16 md:pb-20 container mx-auto px-6">
                <div className="max-w-6xl mx-auto space-y-8">
                    <Button variant="ghost" asChild className="pl-0 -ml-2 text-muted-foreground hover:text-primary transition-colors">
                        <Link href={`/${lang}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {dict.common.back_home}
                        </Link>
                    </Button>

                    <div className="space-y-6">
                        <div className="flex items-center gap-3 text-sm font-bold text-primary tracking-widest uppercase">
                            <span className="w-8 h-px bg-primary"></span>
                            {lang === 'zh' ? '博文' : 'Article'}
                        </div>
                        <h1 className="text-4xl md:text-7xl font-serif font-black tracking-tight leading-[1.15]">
                            {post.title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-6 pt-4 text-muted-foreground border-t border-foreground/5 mt-8">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                                    {post.author?.charAt(0).toUpperCase() || 'A'}
                                </div>
                                <span className="font-bold text-foreground">{post.author || 'Anonymous'}</span>
                            </div>
                            <span className="text-foreground/10">|</span>
                            <time dateTime={post.date} className="text-sm font-medium">
                                {formatDistance(new Date(post.date), new Date(), { addSuffix: true, locale: dateLocale })}
                            </time>
                        </div>
                    </div>
                </div>
            </div>

            {/* Optimized Content Area */}
            <main className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row gap-16 max-w-7xl mx-auto">
                    {/* Main Article Content */}
                    <article className="flex-1 min-w-0 prose prose-lg dark:prose-invert max-w-6xl mx-auto
                        prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight 
                        prose-p:text-foreground/80 prose-p:leading-8 prose-p:my-8
                        prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-primary/30 
                        prose-img:rounded-3xl prose-img:shadow-2xl
                        prose-pre:bg-muted/30 prose-pre:border-none prose-pre:p-0 prose-pre:overflow-hidden
                    ">
                        <MDXContent source={post.content || ''} dict={dict} />
                    </article>

                    {/* Sidebar - TOC Plugin Slot */}
                    <aside className="hidden xl:block w-72 sticky top-24 self-start">
                        <PluginSlot name="post-sidebar" />
                    </aside>
                </div>
            </main>
        </div>
    );
}
