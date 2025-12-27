'use client';

import React, { useState, useEffect } from 'react';
import { evaluate } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import remarkGfm from 'remark-gfm';
import ReactMarkdown from 'react-markdown';
import InteractiveChart from './mdx/interactive-chart';
import CustomModal from './mdx/custom-modal';
import MarkdownCodeBlock from '@/components/MarkdownCodeBlock';

// MDX components for preview
const components = {
    InteractiveChart,
    CustomModal,
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="my-6 leading-8 text-base text-foreground" {...props} />
    ),
    h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h1 className="text-3xl font-bold border-b pb-4 mb-6 mt-10" {...props} />
    ),
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h2 className="text-2xl font-bold mb-4 mt-8" {...props} />
    ),
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
        <h3 className="text-xl font-semibold mb-3 mt-6" {...props} />
    ),
    a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
        <a
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 underline-offset-2 transition-colors font-medium break-words"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        />
    ),
    code: ({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        const codeContent = String(children).replace(/\n$/, '');

        if (match) {
            return (
                <MarkdownCodeBlock
                    language={language}
                    code={codeContent}
                    className={className}
                />
            );
        }

        return (
            <code
                className="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-medium text-pink-500 dark:text-pink-400 font-mono"
                {...props}
            >
                {children}
            </code>
        );
    },
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
        <pre className="mt-0 mb-0" {...props} />
    ),
    table: (props: React.HTMLAttributes<HTMLTableElement>) => (
        <div className="table-responsive my-6">
            <table className="min-w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm" {...props} />
        </div>
    ),
    thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <thead className="bg-muted/50" {...props} />
    ),
    tbody: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
        <tbody className="divide-y divide-border" {...props} />
    ),
    tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
        <tr className="hover:bg-muted/30 transition-colors" {...props} />
    ),
    th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <th className="border border-border px-4 py-3 text-left font-semibold text-foreground" {...props} />
    ),
    td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
        <td className="border border-border px-4 py-3 text-foreground" {...props} />
    ),
    ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
        <ul className="my-6 space-y-2 pl-8 list-disc marker:text-muted-foreground" {...props} />
    ),
    ol: (props: React.OlHTMLAttributes<HTMLOListElement>) => (
        <ol className="my-6 space-y-2 pl-8 list-decimal marker:text-muted-foreground" {...props} />
    ),
    li: (props: React.HTMLAttributes<HTMLLIElement>) => (
        <li className="text-base text-foreground" {...props} />
    ),
    blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
        <blockquote
            className="my-6 border-l-4 border-primary/30 pl-6 py-4 bg-muted/20 rounded-r-lg italic text-foreground"
            {...props}
        />
    ),
    hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
        <hr className="my-8 border-0 border-t border-border/50" {...props} />
    ),
};

// ReactMarkdown components (slightly different signature)
const markdownComponents = {
    p: ({ node, ...props }: any) => <p className="my-6 leading-8 text-base text-foreground" {...props} />,
    h1: ({ node, ...props }: any) => <h1 className="text-3xl font-bold border-b pb-4 mb-6 mt-10" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-2xl font-bold mb-4 mt-8" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-xl font-semibold mb-3 mt-6" {...props} />,
    a: ({ node, ...props }: any) => (
        <a
            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline decoration-blue-300 underline-offset-2 transition-colors font-medium break-words"
            target="_blank"
            rel="noopener noreferrer"
            {...props}
        />
    ),
    code: ({ node, inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || '');
        const language = match ? match[1] : '';
        const codeContent = String(children).replace(/\n$/, '');

        if (!inline && match) {
            return (
                <MarkdownCodeBlock
                    language={language}
                    code={codeContent}
                    className={className}
                />
            );
        }

        return (
            <code
                className={`${className || ''} bg-muted/50 px-1.5 py-0.5 rounded text-sm font-medium text-pink-500 dark:text-pink-400 font-mono`}
                {...props}
            >
                {children}
            </code>
        );
    },
    pre: ({ node, ...props }: any) => <pre className="mt-0 mb-0" {...props} />,
    table: ({ node, ...props }: any) => (
        <div className="table-responsive my-6">
            <table className="min-w-full border-collapse border border-border rounded-lg overflow-hidden shadow-sm" {...props} />
        </div>
    ),
    thead: ({ node, ...props }: any) => <thead className="bg-muted/50" {...props} />,
    tbody: ({ node, ...props }: any) => <tbody className="divide-y divide-border" {...props} />,
    tr: ({ node, ...props }: any) => <tr className="hover:bg-muted/30 transition-colors" {...props} />,
    th: ({ node, ...props }: any) => (
        <th className="border border-border px-4 py-3 text-left font-semibold text-foreground" {...props} />
    ),
    td: ({ node, ...props }: any) => (
        <td className="border border-border px-4 py-3 text-foreground" {...props} />
    ),
    ul: ({ node, ...props }: any) => (
        <ul className="my-6 space-y-2 pl-8 list-disc marker:text-muted-foreground" {...props} />
    ),
    ol: ({ node, ...props }: any) => (
        <ol className="my-6 space-y-2 pl-8 list-decimal marker:text-muted-foreground" {...props} />
    ),
    li: ({ node, ...props }: any) => <li className="text-base text-foreground" {...props} />,
    blockquote: ({ node, ...props }: any) => (
        <blockquote
            className="my-6 border-l-4 border-primary/30 pl-6 py-4 bg-muted/20 rounded-r-lg italic text-foreground"
            {...props}
        />
    ),
    hr: ({ node, ...props }: any) => <hr className="my-8 border-0 border-t border-border/50" {...props} />
};

interface MDXPreviewProps {
    source: string;
    dict?: any;
}

// Check if content contains MDX-specific syntax (custom components)
function containsMDXComponents(source: string): boolean {
    return /<(InteractiveChart|CustomModal)/i.test(source);
}

export function MDXPreview({ source, dict }: MDXPreviewProps) {
    const [content, setContent] = useState<React.ReactNode>(null);
    const [useFallback, setUseFallback] = useState(false);

    useEffect(() => {
        if (!source || source.trim() === '') {
            setContent(null);
            setUseFallback(false);
            return;
        }

        // If no MDX components, use ReactMarkdown directly (faster and more lenient)
        if (!containsMDXComponents(source)) {
            setUseFallback(true);
            setContent(
                <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                    {source}
                </ReactMarkdown>
            );
            return;
        }

        // Try MDX compilation for content with custom components
        const compileMDX = async () => {
            try {
                const { default: MDXContent } = await evaluate(source, {
                    ...runtime,
                    remarkPlugins: [remarkGfm],
                    development: false,
                } as any);

                const previewComponents = {
                    ...components,
                    CustomModal: (props: any) => <CustomModal {...props} dict={dict} />,
                };

                setContent(<MDXContent components={previewComponents} />);
                setUseFallback(false);
            } catch (err) {
                console.warn('MDX compilation failed, falling back to ReactMarkdown:', err);
                // Fallback to ReactMarkdown for content that can't be parsed as MDX
                setUseFallback(true);
                setContent(
                    <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                        {source}
                    </ReactMarkdown>
                );
            }
        };

        const timeoutId = setTimeout(compileMDX, 300);
        return () => clearTimeout(timeoutId);
    }, [source, dict]);

    return <>{content}</>;
}