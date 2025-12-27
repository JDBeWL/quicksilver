import { MDXRemote } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import ReactMarkdown from 'react-markdown';
import InteractiveChart from './mdx/interactive-chart';
import CustomModal from './mdx/custom-modal';
import MarkdownCodeBlock from '@/components/MarkdownCodeBlock';

// Define custom components for MDX
const mdxComponents = {
    p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
        <p className="my-6 leading-8 text-base text-foreground" {...props} />
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
    InteractiveChart,
    CustomModal,
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
    code: (props: React.HTMLAttributes<HTMLElement> & { className?: string }) => {
        const { className, children, ...rest } = props;
        const isCodeBlock = className?.includes('language-');
        if (isCodeBlock) {
            return <code className={className} {...rest}>{children}</code>;
        }
        return (
            <code
                className="bg-muted/50 px-1.5 py-0.5 rounded text-sm font-medium text-pink-500 dark:text-pink-400 font-mono"
                {...rest}
            >
                {children}
            </code>
        );
    },
    pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
        <pre className="mt-0 mb-0 overflow-x-auto" {...props} />
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
};

// ReactMarkdown components
const markdownComponents = {
    p: ({ node, ...props }: any) => <p className="my-6 leading-8 text-base text-foreground" {...props} />,
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
    hr: ({ node, ...props }: any) => (
        <hr className="my-8 border-0 border-t border-border/50" {...props} />
    ),
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
};

interface MDXContentProps {
    source: string;
    dict?: any;
}

// Check if content contains MDX-specific syntax
function containsMDXComponents(source: string): boolean {
    return /<(InteractiveChart|CustomModal)/i.test(source);
}

export async function MDXContent({ source, dict }: MDXContentProps) {
    if (!source || source.trim() === '') {
        return null;
    }

    // If no MDX components, use ReactMarkdown directly (more lenient with special characters)
    if (!containsMDXComponents(source)) {
        return (
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                {source}
            </ReactMarkdown>
        );
    }

    // Use MDX for content with custom components
    const componentsProp = {
        ...mdxComponents,
        CustomModal: (props: any) => <CustomModal {...props} dict={dict} />,
    };

    try {
        return (
            <MDXRemote
                source={source}
                components={componentsProp}
                options={{
                    mdxOptions: {
                        remarkPlugins: [remarkGfm],
                        rehypePlugins: [rehypeHighlight],
                    },
                }}
            />
        );
    } catch (error) {
        // Fallback to ReactMarkdown if MDX fails
        console.error('MDX rendering failed, using ReactMarkdown fallback:', error);
        return (
            <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
                {source}
            </ReactMarkdown>
        );
    }
}
