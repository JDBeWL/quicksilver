import LoginForm from '@/components/LoginForm';
import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';

// Force SSR for login page
export const dynamic = 'force-dynamic';

export default async function LoginPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const blogMode = process.env.BLOG_MODE || 'personal';
    const allowRegister = blogMode === 'multi_user';

    return <LoginForm dict={dict} lang={lang} allowRegister={allowRegister} />;
}
