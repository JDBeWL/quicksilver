import RegisterForm from '@/components/RegisterForm';
import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import Link from 'next/link';

// Disable static generation for this route due to dynamic server usage (headers)
export const dynamic = 'force-dynamic';

export default async function RegisterPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const blogMode = process.env.BLOG_MODE || 'personal';

    if (blogMode === 'personal') {
        return (
            <div className="flex items-center justify-center flex-1 px-4 py-8">
                <div className="w-full max-w-md text-center space-y-4">
                    <h1 className="text-2xl font-bold tracking-tight">{dict.auth.register_disabled.title}</h1>
                    <p className="text-muted-foreground">{dict.auth.register_disabled.desc}</p>
                    <p className="text-sm text-muted-foreground">{dict.auth.register_disabled.owner_desc}</p>
                    <div className="pt-4">
                        <Link href={`/${lang}/login`} className="text-primary hover:underline underline-offset-4">
                            {dict.auth.register_disabled.back_login}
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return <RegisterForm dict={dict} lang={lang} inviteCodeRequired={true} />;
}
