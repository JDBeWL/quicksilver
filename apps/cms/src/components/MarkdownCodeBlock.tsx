'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Highlight, themes } from 'prism-react-renderer';

interface MarkdownCodeBlockProps {
    language: string;
    code: string;
    className?: string;
}

export default function MarkdownCodeBlock({ language, code, className }: MarkdownCodeBlockProps) {
    const [isCopied, setIsCopied] = useState(false);

    const copyToClipboard = async () => {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className={cn("relative group my-6 border rounded-lg overflow-hidden bg-muted/30 text-sm", className)}>
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
                <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
                    {language || 'text'}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={copyToClipboard}
                >
                    {isCopied ? (
                        <Check className="h-3 w-3 text-green-500" />
                    ) : (
                        <Copy className="h-3 w-3" />
                    )}
                    <span className="sr-only">Copy code</span>
                </Button>
            </div>

            <Highlight
                theme={themes.vsDark}
                code={code}
                language={language as any}
            >
                {({ className: prismClassName, style, tokens, getLineProps, getTokenProps }) => (
                    <div className="overflow-x-auto p-4" style={style}>
                        <pre className={cn("font-mono text-sm bg-transparent p-0 m-0", prismClassName)} style={style}>
                            {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({ line })}>
                                    {line.map((token, key) => (
                                        <span key={key} {...getTokenProps({ token })} />
                                    ))}
                                </div>
                            ))}
                        </pre>
                    </div>
                )}
            </Highlight>
        </div>
    );
}
