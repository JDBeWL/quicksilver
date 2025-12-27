import { getDictionary } from "@/get-dictionary";
import { Locale } from "@/i18n-config";
import { prisma } from "@/lib/prisma";

// Force SSG for about page
export const dynamic = 'force-static';

export async function generateStaticParams() {
    return [
        { lang: 'en' },
        { lang: 'zh' }
    ];
}

export default async function AboutPage({
    params,
}: {
    params: Promise<{ lang: Locale }>;
}) {
    const { lang } = await params;
    const dict = await getDictionary(lang);

    let systemStatus = 'Active';
    let statusColor = 'bg-green-500';

    try {
        await prisma.$queryRaw`SELECT 1`;
    } catch (e) {
        systemStatus = 'Maintenance';
        statusColor = 'bg-yellow-500';
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        {dict.about.title}
                    </h1>
                    <p className="text-xl text-muted-foreground leading-relaxed">
                        {dict.about.description}
                    </p>
                </div>

                <div className="border-t pt-8">
                    <h2 className="text-2xl font-semibold mb-4">Quicksilver Core</h2>
                    <div className="flex gap-4 items-center p-4 bg-muted/50 rounded-lg">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-400 flex items-center justify-center shadow-inner">
                            <div className={`h-8 w-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 ${systemStatus === 'Active' ? 'animate-pulse' : ''}`}></div>
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">{dict.about.system_status}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className={`h-2 w-2 rounded-full ${statusColor} ${systemStatus === 'Active' ? 'animate-pulse' : ''}`}></span>
                                {systemStatus === 'Active' ? dict.about.status_active : dict.about.status_maintenance}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
