'use client';

// Force dynamic rendering for this route due to auth-related server usage
export const dynamic = 'force-dynamic';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save, Palette, Code, Layout, Eye, EyeOff } from 'lucide-react';

const PLUGIN_TYPES = [
    { value: 'theme', label: 'Theme', icon: Palette, description: 'Customize the appearance with CSS styles' },
    { value: 'feature', label: 'Feature', icon: Code, description: 'Add custom functionality with JavaScript' },
    { value: 'widget', label: 'Widget', icon: Layout, description: 'Create reusable UI components' },
];

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function EditPluginPage({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        type: 'theme',
        styles: '',
        code: '',
        config: '',
        enabled: false,
        priority: 0,
    });
    const [previewEnabled, setPreviewEnabled] = useState(false);

    useEffect(() => {
        fetchPlugin();
    }, [id]);

    // Live preview effect
    useEffect(() => {
        if (previewEnabled && formData.styles) {
            const styleId = 'plugin-preview-styles';
            let styleElement = document.getElementById(styleId) as HTMLStyleElement;

            if (!styleElement) {
                styleElement = document.createElement('style');
                styleElement.id = styleId;
                document.head.appendChild(styleElement);
            }

            styleElement.textContent = formData.styles;

            return () => {
                styleElement?.remove();
            };
        } else {
            const existingStyle = document.getElementById('plugin-preview-styles');
            existingStyle?.remove();
        }
    }, [previewEnabled, formData.styles]);

    async function fetchPlugin() {
        try {
            const response = await fetch(`/api/plugins/${id}`);
            if (!response.ok) throw new Error('Failed to fetch plugin');
            const data = await response.json();
            setFormData({
                name: data.name || '',
                slug: data.slug || '',
                description: data.description || '',
                type: data.type || 'theme',
                styles: data.styles || '',
                code: data.code || '',
                config: data.config || '',
                enabled: data.enabled || false,
                priority: data.priority || 0,
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await fetch(`/api/plugins/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update plugin');
            }

            router.push('/dashboard/plugins');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-muted-foreground">Loading plugin...</div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" asChild>
                        <Link href="/dashboard/plugins">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Link>
                    </Button>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {previewEnabled ? (
                            <Eye className="h-4 w-4 text-green-500" />
                        ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Label htmlFor="preview">Live Preview</Label>
                        <Switch
                            id="preview"
                            checked={previewEnabled}
                            onCheckedChange={setPreviewEnabled}
                        />
                    </div>
                </div>
            </div>

            <div>
                <h1 className="text-2xl font-bold">Edit Plugin</h1>
                <p className="text-muted-foreground">
                    Modify your plugin settings and code
                </p>
            </div>

            {error && (
                <div className="text-red-500 text-sm p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Plugin details and settings</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                            <div>
                                <Label htmlFor="enabled" className="font-medium">Enable Plugin</Label>
                                <p className="text-sm text-muted-foreground">
                                    When enabled, this plugin will be active on your blog
                                </p>
                            </div>
                            <Switch
                                id="enabled"
                                checked={formData.enabled}
                                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                            />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="My Awesome Plugin"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={formData.slug}
                                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                    placeholder="my-awesome-plugin"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Describe what your plugin does..."
                                rows={2}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority</Label>
                            <Input
                                id="priority"
                                type="number"
                                value={formData.priority}
                                onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                            />
                            <p className="text-xs text-muted-foreground">
                                Lower numbers load first. Use this to control plugin load order.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Plugin Type */}
                <Card>
                    <CardHeader>
                        <CardTitle>Plugin Type</CardTitle>
                        <CardDescription>The type of plugin determines its behavior</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            {PLUGIN_TYPES.map((type) => {
                                const Icon = type.icon;
                                return (
                                    <button
                                        key={type.value}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, type: type.value }))}
                                        className={`p-4 rounded-lg border-2 text-left transition-all ${formData.type === type.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-border hover:border-primary/50'
                                            }`}
                                    >
                                        <Icon className="h-6 w-6 mb-2" />
                                        <div className="font-medium">{type.label}</div>
                                        <div className="text-sm text-muted-foreground">{type.description}</div>
                                    </button>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* CSS Styles */}
                <Card>
                    <CardHeader>
                        <CardTitle>CSS Styles</CardTitle>
                        <CardDescription>
                            Add custom CSS to change the appearance of your blog
                            {previewEnabled && (
                                <span className="ml-2 text-green-500">(Live preview active)</span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.styles}
                            onChange={(e) => setFormData(prev => ({ ...prev, styles: e.target.value }))}
                            placeholder={`/* Example: Change primary color */
:root {
  --primary: #8b5cf6;
}

/* Example: Custom button styles */
.custom-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}`}
                            rows={12}
                            className="font-mono text-sm"
                        />
                    </CardContent>
                </Card>

                {/* JavaScript Code */}
                <Card>
                    <CardHeader>
                        <CardTitle>JavaScript Code</CardTitle>
                        <CardDescription>
                            Add custom JavaScript to extend functionality
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.code}
                            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            placeholder={`// Available APIs:
// api.log(message) - Log with plugin name prefix
// api.getElement(selector) - Get single element
// api.getElements(selector) - Get all elements
// api.addClass(selector, className) - Add class
// api.removeClass(selector, className) - Remove class
// api.setStyle(selector, property, value) - Set inline style
// api.setCSSVariable(name, value) - Set CSS variable
// api.onEvent(selector, event, handler) - Add event listener

api.log('Plugin initialized!');`}
                            rows={16}
                            className="font-mono text-sm"
                        />
                    </CardContent>
                </Card>

                {/* Configuration */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuration (JSON)</CardTitle>
                        <CardDescription>
                            Optional JSON configuration that your plugin can access
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            value={formData.config}
                            onChange={(e) => setFormData(prev => ({ ...prev, config: e.target.value }))}
                            placeholder={`{
  "primaryColor": "#8b5cf6",
  "darkMode": true,
  "animationSpeed": 300
}`}
                            rows={6}
                            className="font-mono text-sm"
                        />
                    </CardContent>
                </Card>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Button type="submit" disabled={saving}>
                        <Save className="mr-2 h-4 w-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button type="button" variant="outline" asChild>
                        <Link href="/dashboard/plugins">Cancel</Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}
