import { getSafeSession } from '@/lib/auth-wrapper';
import { redirect } from 'next/navigation';
import PostForm from '@/components/PostForm';
import { Locale } from '@/i18n-config';
import { getDictionary } from '@/get-dictionary';

// Force SSR for create page
export const dynamic = 'force-dynamic';

export default async function CreatePostPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const session = await getSafeSession();
    if (!session || !session.user?.id) redirect(`/${lang}/login`);
    const dict = await getDictionary(lang);

    return (
        <div className="py-8">
            <PostForm lang={lang} dict={dict} />
        </div>
    );
}
