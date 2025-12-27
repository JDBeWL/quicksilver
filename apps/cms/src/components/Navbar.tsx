import Link from 'next/link';
import { getSafeSession } from '@/lib/auth-wrapper'; // Use safe session getter
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, User, PenTool } from 'lucide-react';
import LogoutButton from '@/components/LogoutButton'; // Client component for logout action
import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';
import { PluginSlot } from '@/components/PluginSlot';

// Force dynamic rendering for navbar due to auth session usage
export const dynamic = 'force-dynamic';

export default async function Navbar({ lang }: { lang: Locale }) {
    const session = await getSafeSession();
    const dict = await getDictionary(lang);

    return (
        <header className="border-b border-foreground/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
            <div className="container mx-auto px-4 flex h-14 items-center justify-between">
                <Link href={`/${lang}`} className="flex items-center space-x-2 font-black text-xl tracking-tight">
                    <span className="text-foreground">{dict.navbar.brand}</span>
                </Link>
                <nav className="flex items-center space-x-6">
                    <PluginSlot name="navbar-end" />
                    <Link href={`/${lang}/about`} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                        {dict.navbar.about}
                    </Link>
                    {session ? (
                        <>
                            <Button variant="ghost" asChild className="text-foreground hover:text-foreground hover:bg-foreground/5 font-medium">
                                <Link href={`/${lang}/dashboard/create`}>
                                    <PenTool className="mr-2 h-4 w-4" />
                                    {dict.navbar.write}
                                </Link>
                            </Button>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-foreground/20 hover:border-foreground/40 hover:bg-foreground/5">
                                        <Avatar className="h-8 w-8">
                                            {/* Placeholder for now */}
                                            <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
                                            <AvatarFallback className="bg-foreground text-background font-medium">
                                                {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent className="w-56 border border-foreground/10 bg-card" align="end" forceMount>
                                    <DropdownMenuItem asChild className="hover:bg-foreground/5 focus:bg-foreground/5">
                                        <Link href={`/${lang}/dashboard`} className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            {dict.navbar.dashboard}
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild className="hover:bg-foreground/5 focus:bg-foreground/5">
                                        <div>
                                            <LogoutButton text={dict.navbar.logout} />
                                        </div>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <>
                            <Button variant="ghost" asChild className="text-foreground hover:text-foreground hover:bg-foreground/5 font-medium">
                                <Link href={`/${lang}/login`}>{dict.navbar.login}</Link>
                            </Button>
                            {process.env.BLOG_MODE === 'multi_user' && (
                                <Button variant="outline" asChild className="border-foreground/20 hover:bg-foreground hover:text-background hover:border-foreground font-medium">
                                    <Link href={`/${lang}/register`}>{dict.navbar.register}</Link>
                                </Button>
                            )}
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
}
