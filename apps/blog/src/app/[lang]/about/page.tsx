import { notFound } from 'next/navigation';
import { getPageBySlug } from '@quicksilver/content-core';
import { MDXContent } from '../../../components/mdx-content';
import { getDictionary } from '../../../get-dictionary';
import { Locale } from '../../../i18n-config';
import Link from 'next/link';
import { Button } from '../../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function AboutPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const page = getPageBySlug('about');

    if (!page) {
        notFound();
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Editorial Header */}
            <div className="w-full pt-16 pb-20 md:pt-24 md:pb-32 container mx-auto px-6">
                <div className="max-w-6xl mx-auto space-y-8 text-center md:text-left">
                    <Button variant="ghost" asChild className="pl-0 -ml-2 text-muted-foreground hover:text-primary transition-colors">
                        <Link href={`/${lang}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {dict.common.back_home}
                        </Link>
                    </Button>

                    <div className="space-y-6">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-sm font-bold text-primary tracking-widest uppercase">
                            <span className="w-8 h-px bg-primary"></span>
                            {dict.navbar.about}
                        </div>
                        <h1 className="text-5xl md:text-7xl font-serif font-black tracking-tight leading-[1.1]">
                            {page.title}
                        </h1>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <main className="container mx-auto px-6">
                <div className="max-w-6xl mx-auto">
                    <article className="prose prose-lg dark:prose-invert max-w-none
                        prose-headings:font-serif prose-headings:font-bold prose-headings:tracking-tight 
                        prose-p:text-foreground/80 prose-p:leading-8 prose-p:my-8
                        prose-blockquote:italic prose-blockquote:border-l-4 prose-blockquote:border-primary/30 
                    ">
                        <MDXContent source={page.content || ''} dict={dict} />
                    </article>
                </div>
            </main>
        </div>
    );
}
