import Link from 'next/link';
import { getDictionary } from '../get-dictionary';
import { Locale } from '../i18n-config';
import { PluginSlot } from './PluginSlot';
import { checkPageExists } from '@quicksilver/content-core';
import { LanguageSwitcher } from './LanguageSwitcher';

export default async function Navbar({ lang }: { lang: Locale }) {
    const dict = await getDictionary(lang);
    const hasAboutPage = checkPageExists('about');

    return (
        <header className="sticky top-0 z-50 w-full border-b border-foreground/5 bg-background/70 backdrop-blur-md">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* 左侧品牌 */}
                <Link href={`/${lang}`} className="flex items-center space-x-2 group">
                    <span className="text-xl font-serif font-black tracking-tight group-hover:text-primary transition-colors">
                        {dict.navbar.brand}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-all"></span>
                </Link>

                {/* 右侧工具栏 */}
                <div className="flex items-center gap-3">
                    <PluginSlot name="navbar-end" />
                    <div className="h-6 w-px bg-foreground/10"></div>
                    <LanguageSwitcher />
                    {hasAboutPage && (
                        <>
                            <div className="h-6 w-px bg-foreground/10"></div>
                            <Link href={`/${lang}/about`} className="text-sm font-medium text-muted-foreground/80 hover:text-foreground transition-all">
                                {dict.navbar.about}
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
