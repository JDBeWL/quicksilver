'use client';

import MarkdownCodeBlock from '@/components/MarkdownCodeBlock';
import InteractiveChart from './mdx/interactive-chart';
import CustomModal from './mdx/custom-modal';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // We might need to create this wrapper or use standard textarea with styling
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch'; // Need to add switch component
import { Loader2 } from 'lucide-react';
import { Locale } from '@/i18n-config';

import { MDXPreview } from '@/components/mdx-preview';
// import rehypeHighlight from 'rehype-highlight';
// import 'highlight.js/styles/github-dark.css';

import { useRef } from 'react';
import { Bold, Italic, Link as LinkIcon, List, Heading1, Heading2, Heading3, Code, Quote, PieChart } from 'lucide-react';

interface PostFormProps {
    post?: {
        title: string;
        slug: string;
        content: string | null;
        published: boolean;
    };
    lang: Locale;
    dict: any;
}

export default function PostForm({ post, lang, dict }: PostFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [content, setContent] = useState(post?.content || '');
    const [currentTip, setCurrentTip] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const title = formData.get('title') as string;
        const slug = formData.get('slug') as string;
        // content is already in state
        const published = formData.get('published') === 'on';

        const url = post ? `/api/posts/${post.slug}` : '/api/posts'; // Changed to slug
        const method = post ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, slug, content, published }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Something went wrong');
            }

            router.push(`/${lang}/dashboard`);
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    // Basic auto-slug generation
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!post) { // Only auto-generate for new posts
            const title = e.target.value;
            const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
            const slugInput = document.getElementById('slug') as HTMLInputElement;
            if (slugInput) slugInput.value = slug;
        }
    }

    // Cycle through tips
    useEffect(() => {
        if (dict.writing.tips && dict.writing.tips.length > 0) {
            const randomIndex = Math.floor(Math.random() * dict.writing.tips.length);
            setCurrentTip(dict.writing.tips[randomIndex]);
        }
    }, [dict.writing.tips]);

    const insertAtCursor = (before: string, after: string = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const previousContent = textarea.value;
        const beforeText = previousContent.substring(0, start);
        const selectedText = previousContent.substring(start, end);
        const afterText = previousContent.substring(end);

        const newContent = `${beforeText}${before}${selectedText}${after}${afterText}`;
        setContent(newContent);

        // Reset cursor position
        requestAnimationFrame(() => {
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = end + before.length;
            textarea.focus();
        });
    };

    return (
        <div className="w-full max-w-[95%] mx-auto">
            <h1 className="text-3xl font-bold tracking-tight mb-8">
                {post ? dict.writing.edit_title : dict.writing.create_title}
            </h1>
            <form onSubmit={onSubmit} className="space-y-6">
                {error && <div className="text-red-500 text-sm">{error}</div>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="title">{dict.writing.title_label}</Label>
                        <Input
                            id="title"
                            name="title"
                            defaultValue={post?.title}
                            onChange={handleTitleChange}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="slug">{dict.writing.slug_label}</Label>
                        <Input id="slug" name="slug" defaultValue={post?.slug} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="content">{dict.writing.content_label}</Label>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Code className="h-3 w-3" />
                                {currentTip || dict.writing.tips[0]}
                            </span>
                        </div>
                        <div className="rounded-md border border-input bg-background flex flex-col h-[600px]">
                            <div className="flex items-center space-x-1 p-2 border-b bg-muted/20 flex-shrink-0">
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('**', '**')} title={dict.writing.toolbar.bold}>
                                    <Bold className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('*', '*')} title={dict.writing.toolbar.italic}>
                                    <Italic className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('[', '](url)')} title={dict.writing.toolbar.link}>
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                                <div className="w-px h-4 bg-border mx-2" />
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('# ', '')} title={dict.writing.toolbar.h1}>
                                    <Heading1 className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('## ', '')} title={dict.writing.toolbar.h2}>
                                    <Heading2 className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('### ', '')} title={dict.writing.toolbar.h3}>
                                    <Heading3 className="h-4 w-4" />
                                </Button>
                                <div className="w-px h-4 bg-border mx-2" />
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('- ', '')} title={dict.writing.toolbar.list}>
                                    <List className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('> ', '')} title={dict.writing.toolbar.quote}>
                                    <Quote className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('```\n', '\n```')} title={dict.writing.toolbar.code}>
                                    <Code className="h-4 w-4" />
                                </Button>
                                <div className="w-px h-4 bg-border mx-2" />
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('<InteractiveChart />', '')} title={dict.writing.toolbar.chart} className="gap-1 items-center">
                                    <PieChart className="h-4 w-4" />
                                    <span className="text-xs font-medium">{dict.writing.toolbar.chart}</span>
                                </Button>
                                <Button type="button" variant="ghost" size="sm" onClick={() => insertAtCursor('<CustomModal triggerText="Open Modal" title="My Modal">\n  Modal Content Here\n</CustomModal>', '')} title={dict.writing.toolbar.modal} className="gap-1 items-center">
                                    <span className="text-xs font-bold border rounded px-1">M</span>
                                    <span className="text-xs font-medium">{dict.writing.toolbar.modal}</span>
                                </Button>
                            </div>
                            <textarea
                                id="content"
                                name="content"
                                ref={textareaRef}
                                className="flex-1 rounded-b-md bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 font-mono resize-none p-4 border-0 focus-visible:ring-0 overflow-y-auto"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="# Hello World"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col space-y-2">
                        <Label>{dict.writing.preview_label}</Label>
                        <div className="rounded-md border border-input bg-card text-card-foreground px-6 py-4 overflow-y-auto prose prose-gray dark:prose-invert max-w-none prose-pre:p-0 h-[600px]">
                            {content ? (
                                <MDXPreview source={content} dict={dict} />
                            ) : (
                                <div className="text-muted-foreground">{dict.writing.nothing_to_preview}</div>
                            )}
                            {content && (
                                <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground">
                                    <p>{dict.writing.mdx_guide.title}</p>
                                    <ul className="list-disc list-inside space-y-1 mt-1">
                                        <li>{dict.writing.mdx_guide.chart_example}</li>
                                        <li>{dict.writing.mdx_guide.modal_example}</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t pt-6">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="published"
                            name="published"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            defaultChecked={post?.published}
                        />
                        <Label htmlFor="published">{dict.writing.publish_label}</Label>
                    </div>

                    <Button type="submit" disabled={isLoading} size="lg">
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {post ? dict.writing.update_button : dict.writing.create_button}
                    </Button>
                </div>
            </form >
        </div >
    );
}
