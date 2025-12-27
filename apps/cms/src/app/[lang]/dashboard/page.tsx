import Link from 'next/link';
import { getAllPosts } from '@quicksilver/content-core';
import { getSafeSession } from '@/lib/auth-wrapper';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Edit, Trash2 } from 'lucide-react';
import DeletePostButton from '@/components/DeletePostButton';


import { getDictionary } from '@/get-dictionary';
import { Locale } from '@/i18n-config';

// Force SSR for dashboard
export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params;
    const dict = await getDictionary(lang);
    const session = await getSafeSession();
    if (!session?.user?.id) {
        redirect(`/${lang}/login`);
    }

    const posts = getAllPosts();

    return (
        <div className="space-y-8 py-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">{dict.navbar.dashboard}</h1>
                <Button asChild>
                    <Link href={`/${lang}/dashboard/create`}>
                        <Plus className="mr-2 h-4 w-4" />
                        {dict.navbar.write}
                    </Link>
                </Button>
            </div>

            {/* Statistics Section */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{dict.dashboard.stats.total_posts}</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{posts.length}</div>
                        <p className="text-xs text-muted-foreground">
                            {dict.dashboard.stats.lifetime_entries}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{dict.dashboard.stats.published}</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M2 12h20" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{posts.filter(p => p.published).length}</div>
                        <p className="text-xs text-muted-foreground">
                            {dict.dashboard.stats.visible_world}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{dict.dashboard.stats.drafts}</CardTitle>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            className="h-4 w-4 text-muted-foreground"
                        >
                            <path d="M12 2v20M2 12h20" />
                        </svg>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{posts.filter(p => !p.published).length}</div>
                        <p className="text-xs text-muted-foreground">
                            {dict.dashboard.stats.works_progress}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4">
                {posts.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-16 text-center text-muted-foreground flex flex-col items-center gap-4">
                            <div className="bg-muted p-4 rounded-full">
                                <Plus className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">{dict.dashboard.empty.title}</h3>
                                <p className="text-sm">{dict.dashboard.empty.desc}</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    posts.map((post: any) => (
                        <Card key={post.slug} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 transition-all hover:shadow-md">
                            <div className="space-y-1 mb-4 sm:mb-0">
                                <CardTitle className="text-xl flex items-center gap-3">
                                    <Link href={`/${lang}/dashboard/edit/${post.slug}`} className="hover:underline decoration-2 underline-offset-4">
                                        {post.title}
                                    </Link>
                                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${post.published
                                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                                        : 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                        }`}>
                                        {post.published ? dict.dashboard.status.published : dict.dashboard.status.draft}
                                    </span>
                                </CardTitle>
                                <CardDescription className="flex items-center gap-2 text-sm">
                                    <span>{new Date(post.date).toLocaleDateString()}</span>
                                    <span>•</span>
                                    <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">/{post.slug}</span>
                                </CardDescription>
                            </div>
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                                <Button variant="secondary" size="sm" asChild className="flex-1 sm:flex-none">
                                    <Link href={`/${lang}/dashboard/edit/${post.slug}`}>
                                        <Edit className="h-4 w-4 mr-2" />
                                        {dict.post.edit}
                                    </Link>
                                </Button>
                                <DeletePostButton postId={post.slug} />
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
