import { getSafeSession } from '@/lib/auth-wrapper';
import { redirect, notFound } from 'next/navigation';
import { getPostBySlug } from '@quicksilver/content-core';
import PostForm from '@/components/PostForm';
import { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';

// Force SSR for edit page
export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params }: { params: Promise<{ slug: string; lang: Locale }> }) {
    const session = await getSafeSession();
    const { slug, lang } = await params;

    if (!session || !session.user?.id) redirect(`/${lang}/login`);
    const dict = await getDictionary(lang);

    const post = getPostBySlug(slug);

    if (!post) notFound();

    return (
        <div className="py-8">
            <PostForm post={post} lang={lang} dict={dict} />
        </div>
    );
}
