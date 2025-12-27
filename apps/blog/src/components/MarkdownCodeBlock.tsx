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
        <div className={cn(
            "relative group my-8 rounded-xl overflow-hidden bg-[#0d1117] shadow-2xl transition-all",
            className
        )}>
            {/* Unified Header Overlay */}
            <div className="absolute top-2 right-2 flex items-center gap-2 z-10 opacity-30 group-hover:opacity-100 transition-opacity">
                <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-mono text-muted-foreground uppercase tracking-widest backdrop-blur-sm">
                    {language || 'text'}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-md bg-white/5 border border-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
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
                    <div className="overflow-x-auto">
                        <pre 
                            className={cn(
                                "font-mono text-[13px] leading-relaxed p-5 m-0 min-w-full",
                                prismClassName
                            )} 
                            style={{
                                ...style,
                                margin: 0,
                                paddingTop: '1.25rem',
                                paddingBottom: '1.25rem',
                                borderRadius: 0,
                                boxShadow: 'none',
                                border: 'none',
                                outline: 'none',
                                background: 'transparent'
                            }}
                        >
                            {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({ line, className: "flex min-w-full" })}>
                                    <span className="shrink-0 select-none pr-6 text-white/20 text-right w-12 text-xs">{i + 1}</span>
                                    <span className="flex-1">
                                        {line.map((token, key) => (
                                            <span key={key} {...getTokenProps({ token })} />
                                        ))}
                                    </span>
                                </div>
                            ))}
                        </pre>
                    </div>
                )}
            </Highlight>
        </div>
    );
}
