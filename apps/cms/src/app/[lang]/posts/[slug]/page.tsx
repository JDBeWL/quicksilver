import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import 'highlight.js/styles/github-dark.css';
import { MDXContent } from '@/components/mdx-content';
import { formatDistance } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getSafeSession } from '@/lib/auth-wrapper';
import { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';
import { PluginSlot } from '@/components/PluginSlot';

// Force dynamic rendering with ISR for blog posts
export const dynamic = 'force-dynamic';

// Set ISR revalidation for blog posts - revalidate every 60 seconds
export const revalidate = 60;

export default async function PostPage({ params }: { params: Promise<{ slug: string; lang: Locale }> }) {
    const { slug, lang } = await params;
    const dict = await getDictionary(lang);
    const post = await prisma.post.findUnique({
        where: { slug },
        include: {
            author: {
                select: { name: true, email: true },
            },
        },
    });

    if (!post) {
        notFound();
    }

    const session = await getSafeSession();
    const isAuthor = session?.user?.id === post.authorId;

    // Date locale handling
    const { enUS, zhCN } = require('date-fns/locale');
    const localeMap: Record<string, any> = {
        'en': enUS,
        'zh': zhCN,
    };
    const dateLocale = localeMap[lang] || enUS;

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Banner Area */}
            <div className="w-full bg-muted/30 border-b mb-10">
                <div className="max-w-7xl mx-auto px-6 py-4 md:py-8">
                    <Button variant="ghost" asChild className="pl-0 mb-6 hover:bg-transparent hover:text-primary -ml-2">
                        <Link href={`/${lang}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {dict.common.back_home}
                        </Link>
                    </Button>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight">
                        {post.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback>{post.author.name?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-foreground">{post.author.name || dict.post.anonymous}</span>
                        </div>
                        <span className="hidden sm:inline text-muted-foreground/50">•</span>
                        <time dateTime={post.createdAt.toISOString()} suppressHydrationWarning>
                            {formatDistance(new Date(post.createdAt), new Date(), { addSuffix: true, locale: dateLocale })}
                        </time>
                        {isAuthor && (
                            <>
                                <span className="hidden sm:inline text-muted-foreground/50">•</span>
                                <Link href={`/${lang}/dashboard/edit/${post.id}`} className="text-primary hover:underline font-medium">
                                    {dict.post.edit}
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area - Two Column Layout */}
            <main className="max-w-7xl mx-auto px-6">
                <div className="flex gap-8">
                    {/* Main Article Content */}
                    <article className="flex-1 min-w-0 text-base md:text-lg leading-7
                        prose prose-lg md:prose-xl dark:prose-invert max-w-none
                        prose-headings:font-bold prose-headings:tracking-tight 
                        prose-img:rounded-lg prose-img:shadow-md
                        prose-pre:bg-muted/50 prose-pre:border prose-pre:p-0 prose-pre:overflow-hidden
                        prose-p:my-6 prose-p:leading-8
                        prose-ul:my-6 prose-ul:list-disc prose-ul:list-inside
                        prose-ol:my-6 prose-ol:list-decimal prose-ol:list-inside
                        prose-li:my-2 prose-li:pl-2
                        prose-blockquote:border-l-4 prose-blockquote:border-primary/30 prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:bg-muted/20 prose-blockquote:rounded-r-lg
                        prose-hr:my-8 prose-hr:border-0 prose-hr:border-t prose-hr:border-border/50
                    ">
                        <MDXContent source={post.content || ''} dict={dict} />
                    </article>

                    {/* Sidebar - TOC Plugin Slot */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <PluginSlot name="post-sidebar" />
                    </aside>
                </div>
            </main>
        </div>
    );
}
