import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { formatDistance } from 'date-fns';
import { getDictionary } from '../../get-dictionary';
import { Locale } from '../../i18n-config';
import { ArrowRight } from 'lucide-react';
import { getAllPosts } from '@quicksilver/content-core';

export async function generateStaticParams() {
    return [{ lang: 'en' }, { lang: 'zh' }];
}

export const dynamicParams = false;

export default async function Home({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    const allPosts = getAllPosts().filter((p: any) => p.published);
    const featuredPost = allPosts[0];
    const otherPosts = allPosts.slice(1);

    // Date locale handling
    const { enUS, zhCN } = require('date-fns/locale');
    const localeMap: Record<string, any> = { 'en': enUS, 'zh': zhCN };
    const dateLocale = localeMap[lang] || enUS;

    return (
        <div className="pb-24">
            {/* Hero & Featured Section */}
            <section className="relative pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden">
                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-6xl mx-auto text-center mb-16 md:mb-24 space-y-6">
                        <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tighter leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                            {dict.home.hero_title}
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground/90 max-w-2xl mx-auto leading-relaxed font-light animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                            {dict.home.hero_desc}
                        </p>
                    </div>

                    {featuredPost && (
                        <div className="group relative rounded-3xl overflow-hidden border border-foreground/5 bg-card/50 shadow-2xl transition-all duration-500 hover:shadow-primary/5 hover:-translate-y-1">
                            <Link href={`/${lang}/posts/${featuredPost.slug}`} className="flex flex-col lg:flex-row min-h-[400px]">
                                <div className="flex-1 p-8 md:p-12 flex flex-col justify-center space-y-6">
                                    <div className="flex items-center gap-3 text-sm font-semibold text-primary tracking-widest uppercase">
                                        <span className="w-8 h-px bg-primary"></span>
                                        {lang === 'zh' ? '精选文章' : 'Featured Post'}
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-serif font-bold leading-tight group-hover:text-primary transition-colors">
                                        {featuredPost.title}
                                    </h2>
                                    <p className="text-muted-foreground line-clamp-3 leading-relaxed max-w-xl">
                                        {featuredPost.content?.replace(/[#*`_]/g, '') || 'No content provided.'}
                                    </p>
                                    <div className="flex items-center gap-4 pt-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                                            {featuredPost.author?.charAt(0).toUpperCase() || 'A'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold">{featuredPost.author || 'Anonymous'}</span>
                                            <time className="text-xs text-muted-foreground">
                                                {formatDistance(new Date(featuredPost.date), new Date(), { addSuffix: true, locale: dateLocale })}
                                            </time>
                                        </div>
                                    </div>
                                </div>
                                <div className="lg:w-1/3 bg-muted/30 border-l border-foreground/5 flex items-center justify-center p-12 overflow-hidden">
                                    <ArrowRight className="w-24 h-24 text-primary/10 -rotate-45 group-hover:rotate-0 group-hover:text-primary/20 transition-all duration-700 scale-150" />
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <div className="container mx-auto px-6">
                {/* Posts Grid */}
                <section className="space-y-12">
                    <div className="flex items-end justify-between border-b border-foreground/5 pb-6">
                        <h2 className="text-3xl font-serif font-bold tracking-tight">
                            {lang === 'zh' ? '最近发布' : 'Latest Articles'}
                        </h2>
                        <span className="text-sm text-muted-foreground font-medium hidden md:block">
                            {allPosts.length} {lang === 'zh' ? '篇文章' : 'Posts found'}
                        </span>
                    </div>

                    <div className="grid gap-x-8 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
                        {(featuredPost ? otherPosts : allPosts).map((post: any) => (
                            <article key={post.slug} className="group flex flex-col space-y-4">
                                <Link href={`/${lang}/posts/${post.slug}`} className="block relative aspect-[16/10] bg-muted/30 rounded-2xl overflow-hidden border border-foreground/5 group-hover:border-primary/20 transition-all mb-2">
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/5 backdrop-blur-[2px]">
                                        <ArrowRight className="w-8 h-8 text-primary" />
                                    </div>
                                </Link>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground tracking-wider uppercase">
                                        <time dateTime={post.date}>
                                            {formatDistance(new Date(post.date), new Date(), { addSuffix: true, locale: dateLocale })}
                                        </time>
                                    </div>
                                    <h3 className="text-xl font-serif font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                        <Link href={`/${lang}/posts/${post.slug}`}>
                                            {post.title}
                                        </Link>
                                    </h3>
                                    <p className="line-clamp-2 text-muted-foreground/80 text-sm leading-relaxed">
                                        {post.content?.replace(/[#*`_]/g, '') || 'No content provided.'}
                                    </p>
                                    <div className="flex items-center gap-2 pt-2">
                                        <span className="text-xs font-bold border-b border-primary/30">
                                            {post.author || 'Anonymous'}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {allPosts.length === 0 && (
                            <div className="col-span-full flex flex-col items-center justify-center py-32 text-center bg-card/50 rounded-3xl border border-dashed border-foreground/10">
                                <h3 className="text-xl font-serif font-medium text-foreground">{dict.home.no_posts}</h3>
                                <p className="text-muted-foreground mt-2">
                                    {lang === 'zh' ? '这里还没有文章，请稍后查看。' : 'No articles yet. Please check back later.'}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
