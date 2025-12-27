'use client';

// Force dynamic rendering for this route due to auth-related server usage
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Palette, Code, Layout, Power, PowerOff } from 'lucide-react';

interface Plugin {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: string;
    enabled: boolean;
    priority: number;
    createdAt: string;
}

export default function PluginsPage() {
    const [plugins, setPlugins] = useState<Plugin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPlugins();
    }, []);

    async function fetchPlugins() {
        try {
            const response = await fetch('/api/plugins');
            if (!response.ok) throw new Error('Failed to fetch plugins');
            const data = await response.json();
            setPlugins(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    async function togglePlugin(id: string, enabled: boolean) {
        try {
            const response = await fetch(`/api/plugins/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ enabled: !enabled }),
            });
            if (!response.ok) throw new Error('Failed to update plugin');
            fetchPlugins();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }

    async function deletePlugin(id: string) {
        if (!confirm('Are you sure you want to delete this plugin?')) return;

        try {
            const response = await fetch(`/api/plugins/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete plugin');
            fetchPlugins();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        }
    }

    function getTypeIcon(type: string) {
        switch (type) {
            case 'theme': return <Palette className="h-4 w-4" />;
            case 'feature': return <Code className="h-4 w-4" />;
            case 'widget': return <Layout className="h-4 w-4" />;
            default: return <Code className="h-4 w-4" />;
        }
    }

    function getTypeColor(type: string) {
        switch (type) {
            case 'theme': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
            case 'feature': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'widget': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading plugins...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Plugins</h1>
                    <p className="text-muted-foreground">
                        Customize your blog with themes and features
                    </p>
                </div>
                <Button asChild>
                    <Link href="/dashboard/plugins/create">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Plugin
                    </Link>
                </Button>
            </div>

            {error && (
                <div className="text-red-500 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {error}
                </div>
            )}

            {plugins.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Code className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No plugins yet</h3>
                        <p className="text-muted-foreground text-center mb-4">
                            Create your first plugin to customize your blog appearance or add new features.
                        </p>
                        <Button asChild>
                            <Link href="/dashboard/plugins/create">
                                <Plus className="mr-2 h-4 w-4" />
                                Create Your First Plugin
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {plugins.map((plugin) => (
                        <Card key={plugin.id} className={!plugin.enabled ? 'opacity-60' : ''}>
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            {getTypeIcon(plugin.type)}
                                            {plugin.name}
                                        </CardTitle>
                                        <CardDescription>{plugin.slug}</CardDescription>
                                    </div>
                                    <Badge className={getTypeColor(plugin.type)}>
                                        {plugin.type}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {plugin.description && (
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                                        {plugin.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        {plugin.enabled ? (
                                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                                                <Power className="h-3 w-3" /> Enabled
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1">
                                                <PowerOff className="h-3 w-3" /> Disabled
                                            </span>
                                        )}
                                        <span>• Priority: {plugin.priority}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => togglePlugin(plugin.id, plugin.enabled)}
                                    >
                                        {plugin.enabled ? (
                                            <>
                                                <PowerOff className="mr-1 h-3 w-3" />
                                                Disable
                                            </>
                                        ) : (
                                            <>
                                                <Power className="mr-1 h-3 w-3" />
                                                Enable
                                            </>
                                        )}
                                    </Button>
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={`/dashboard/plugins/${plugin.id}`}>
                                            <Pencil className="mr-1 h-3 w-3" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 hover:text-red-700"
                                        onClick={() => deletePlugin(plugin.id)}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
