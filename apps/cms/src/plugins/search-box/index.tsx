'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ClientPlugin } from '@/lib/plugins/types';
import { Search, X } from 'lucide-react';
import { PostData } from '@quicksilver/content-core';

// 多语言文本
const translations = {
    en: {
        search: 'Search',
        searchPlaceholder: 'Search articles...',
        noResults: 'No articles found',
        startTyping: 'Start typing to search',
        noContent: 'No content available',
        loading: 'Loading...'
    },
    zh: {
        search: '搜索',
        searchPlaceholder: '搜索文章...',
        noResults: '没有找到相关文章',
        startTyping: '输入内容开始搜索',
        noContent: '暂无内容',
        loading: '加载中...'
    }
};

interface SearchResult {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
}

interface SearchBoxProps {
    posts?: PostData[];
}

// 创建搜索索引
const getSearchIndex = (posts: PostData[] = [], lang: string) => {
    return posts
        .filter(post => post.published)
        .map(post => ({
            id: post.slug,
            title: post.title,
            slug: post.slug,
            excerpt: post.content
                ? post.content.substring(0, 150).replace(/[#*`]/g, '') + '...'
                : (lang === 'en' ? 'No content available' : '暂无内容'),
            content: post.content.toLowerCase(),
            titleLower: post.title.toLowerCase(),
        }));
};

function SearchBoxComponent({ posts = [] }: SearchBoxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [mounted, setMounted] = useState(false);
    const [currentLang, setCurrentLang] = useState('en');
    const inputRef = useRef<HTMLInputElement>(null);
    
    // 使用传入的posts创建搜索索引
    const searchIndex = useMemo(() => getSearchIndex(posts, currentLang), [posts, currentLang]);
    
    // 获取当前语言的翻译文本
    const t = useMemo(() => translations[currentLang as keyof typeof translations] || translations.en, [currentLang]);

    // 等待客户端挂载并获取当前语言
    useEffect(() => {
        setMounted(true);
        // 从URL路径中获取当前语言
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const possibleLang = pathParts[0];
            if (possibleLang && (possibleLang === 'en' || possibleLang === 'zh')) {
                setCurrentLang(possibleLang);
            }
        }
    }, []);

    // 客户端搜索逻辑 - 恢复原来的即时搜索，不使用防抖
    const results = useMemo(() => {
        if (query.length < 1) return [];
        
        const queryLower = query.toLowerCase();
        
        return searchIndex
            .filter(post => 
                post.titleLower.includes(queryLower) || 
                post.content.includes(queryLower)
            )
            .slice(0, 10);
    }, [query, searchIndex]);

    // 键盘快捷键 (Ctrl/Cmd + K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // 聚焦输入框
    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // 模态框内容
    const modalContent = isOpen ? (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => setIsOpen(false)}
        >
            <div
                className="w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden mb-8"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 搜索输入 */}
                <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
                    <Search className="w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t.searchPlaceholder}
                        className="flex-1 bg-transparent outline-none text-lg"
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* 搜索结果 */}
                <div className="max-h-96 overflow-y-auto">
                    {query.length >= 1 && results.length === 0 && (
                        <div className="p-8 text-center text-gray-500">
                            {t.noResults}
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {results.map((result) => (
                                <a
                                    key={result.id}
                                    href={`/${currentLang}/posts/${result.slug}`}
                                    className="block p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                                        {result.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                        {result.excerpt}
                                    </p>
                                </a>
                            ))}
                        </div>
                    )}

                    {query.length < 1 && (
                        <div className="p-8 text-center text-gray-500">
                            {t.startTyping}
                        </div>
                    )}
                </div>
            </div>
        </div>
    ) : null;

    return (
        <>
            {/* 搜索按钮 */}
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={t.search}
            >
                <Search className="w-4 h-4" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.search}...</span>
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
                    <span>⌘</span>K
                </kbd>
            </button>

            {/* 使用 Portal 将模态框渲染到 body */}
            {mounted && modalContent && createPortal(modalContent, document.body)}
        </>
    );
}

// 创建一个包装组件，用于在客户端组件中提供posts数据
function SearchBoxWrapper() {
    const [posts, setPosts] = React.useState<PostData[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentLang, setCurrentLang] = React.useState('en');
    
    React.useEffect(() => {
        // 从URL路径中获取当前语言
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/').filter(Boolean);
            const possibleLang = pathParts[0];
            if (possibleLang && (possibleLang === 'en' || possibleLang === 'zh')) {
                setCurrentLang(possibleLang);
            }
        }
    }, []);
    
    const t = translations[currentLang as keyof typeof translations] || translations.en;
    
    React.useEffect(() => {
        // 从服务器端获取文章数据
        fetch('/api/posts')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch posts');
                return res.json();
            })
            .then(data => {
                setPosts(data.posts || []);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to load posts:', err);
                setLoading(false);
            });
    }, []);
    
    if (loading) {
        return (
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <Search className="w-4 h-4" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t.loading}</span>
            </div>
        );
    }
    
    return <SearchBoxComponent posts={posts} />;
}

export const SearchBoxPlugin: ClientPlugin = {
    id: 'search-box',
    name: '搜索框插件',
    description: '提供全站文章搜索功能，支持快捷键 Ctrl/Cmd + K',
    components: {
        'navbar-end': SearchBoxWrapper,
    },
    onLoad: () => {
        console.log('Search Box Plugin loaded!');
    }
};
