'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ClientPlugin } from '../../lib/plugins/types';
import { List } from 'lucide-react';

interface TocItem {
    id: string;
    text: string;
    level: number;
}

function TableOfContentsComponent() {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const [isExpanded, setIsExpanded] = useState(true);
    const [isSticky, setIsSticky] = useState(false);
    const [containerInfo, setContainerInfo] = useState({ top: 0, left: 0, width: 0, height: 300, initialHeight: 300 });
    const [isScrolling, setIsScrolling] = useState(false);
    const [isWideEnough, setIsWideEnough] = useState(true);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const isInitialized = useRef(false);
    const articleRef = useRef<HTMLElement | null>(null);

    // 扫描页面标题并设置初始位置
    useEffect(() => {
        const article = document.querySelector('article');
        if (!article) return;

        // 保存文章元素引用，用于计算相对位置
        articleRef.current = article;

        const elements = article.querySelectorAll('h1, h2, h3');
        const items: TocItem[] = [];

        elements.forEach((el, index) => {
            // 为没有 id 的标题生成 id
            if (!el.id) {
                el.id = `heading-${index}`;
            }

            items.push({
                id: el.id,
                text: el.textContent || '',
                level: parseInt(el.tagName.charAt(1)),
            });
        });

        setHeadings(items);

        // 简化的位置更新
        const updateBasicInfo = () => {
            // 检查屏幕宽度
            setIsWideEnough(window.innerWidth >= 1024);

            // 获取初始高度信息
            const tocElement = document.getElementById('toc-container');
            if (tocElement) {
                const initialHeight = tocElement.clientHeight || 300;
                setContainerInfo(prev => ({ ...prev, initialHeight }));
            }
        };

        // 初始化
        const timer = setTimeout(updateBasicInfo, 100);
        window.addEventListener('resize', updateBasicInfo);

        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', updateBasicInfo);
        };
    }, []);

    // 监听滚动更新高亮和 sticky 状态
    useEffect(() => {
        if (headings.length === 0) return;

        // 初始化标记
        isInitialized.current = true;

        // 获取 TOC 容器的初始位置和文章右侧位置
        const getInitialLayout = () => {
            const tocElement = document.getElementById('toc-container');
            const articleElement = articleRef.current;

            if (tocElement && articleElement) {
                const tocRect = tocElement.getBoundingClientRect();
                const articleRect = articleElement.getBoundingClientRect();

                // 计算 TOC 相对于文章右侧的位置
                // articleRect.right 是文章右边缘相对于视口的位置
                // tocRect.right 是 TOC 右边缘相对于视口的位置
                const articleRight = articleRect.right;
                const tocRight = tocRect.right;
                const tocWidth = tocRect.width;

                // 计算 TOC 应该距离视口右侧的距离，以保持它在文章右侧的相对位置
                const rightOffset = window.innerWidth - tocRight;

                // 记录初始高度，用于置顶状态时保持一致
                const initialHeight = tocElement.clientHeight || 300;
                setContainerInfo(prev => ({ ...prev, initialHeight }));

                return {
                    initialOffset: tocRect.top + window.scrollY,
                    rightOffset: rightOffset,
                    articleRight: articleRight,
                    initialHeight
                };
            }
            return null;
        };

        let layoutInfo = getInitialLayout();
        let lastScrollY = window.scrollY;
        let ticking = false;

        const handleScroll = () => {
            lastScrollY = window.scrollY;

            if (!ticking) {
                window.requestAnimationFrame(() => {
                    const scrollTop = lastScrollY;

                    // 如果还没有获取到初始布局，尝试获取
                    if (!layoutInfo) {
                        layoutInfo = getInitialLayout();
                    }

                    // 如果仍然没有获取到布局信息，不处理 sticky 状态
                    if (!layoutInfo) {
                        setIsSticky(false);
                        ticking = false;
                        return;
                    }

                    // 更新文章右侧位置（窗口大小变化时文章位置可能改变）
                    const articleElement = articleRef.current;
                    if (articleElement) {
                        const articleRect = articleElement.getBoundingClientRect();
                        layoutInfo.articleRight = articleRect.right;
                        // 重新计算保持相对位置的 rightOffset
                        layoutInfo.rightOffset = window.innerWidth - (layoutInfo.articleRight - (layoutInfo.articleRight - (window.innerWidth - layoutInfo.rightOffset)));
                    }

                    // 设置一个合理的触发阈值，添加防抖动逻辑，避免在临界值附近频繁切换
                    const threshold = layoutInfo.initialOffset - 120;
                    const shouldStick = layoutInfo.initialOffset > 0 && scrollTop > threshold;
                    setIsSticky(shouldStick);

                    ticking = false;
                });

                ticking = true;
            }
        };

        // 创建 IntersectionObserver
        const observer = new IntersectionObserver(
            (entries) => {
                // 如果正在滚动中（点击目录跳转），则忽略更新
                if (isScrolling) return;

                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: '-80px 0px -80% 0px',
                threshold: 0,
            }
        );

        // 保存引用
        observerRef.current = observer;

        // 观察所有标题元素
        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        // 立即检查一次滚动位置（处理页面加载时已滚动的情况）
        handleScroll();

        // 获取初始容器高度
        setTimeout(() => {
            const tocElement = document.getElementById('toc-container');
            if (tocElement) {
                const initialHeight = tocElement.clientHeight || 300;
                setContainerInfo(prev => ({ ...prev, height: initialHeight, initialHeight }));
            }
        }, 100);

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            observer.disconnect();
        };
    }, [headings]);

    // 点击跳转
    const handleClick = useCallback((id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // 设置滚动状态，暂停 IntersectionObserver
            setIsScrolling(true);
            setActiveId(id);

            const offset = 100; // 顶部偏移
            const top = element.getBoundingClientRect().top + window.scrollY - offset;

            // 执行平滑滚动
            window.scrollTo({ top, behavior: 'smooth' });

            // 确保滚动完成后再恢复 IntersectionObserver
            const scrollDistance = Math.abs(top - window.scrollY);
            const scrollDuration = Math.min(1500, Math.max(800, scrollDistance * 1.5));

            // 添加滚动完成检测
            let scrollCompleteTimer: NodeJS.Timeout;
            let backupTimer: NodeJS.Timeout;

            // 监听滚动完成
            const handleScrollComplete = () => {
                // 当滚动接近目标位置时，认为滚动完成
                const currentScroll = window.scrollY;
                const targetScroll = top;

                if (Math.abs(currentScroll - targetScroll) < 10) {
                    setIsScrolling(false);
                    window.removeEventListener('scroll', handleScrollComplete);
                    clearTimeout(scrollCompleteTimer);
                    clearTimeout(backupTimer);
                }
            };

            // 滚动完成后恢复 IntersectionObserver
            scrollCompleteTimer = setTimeout(() => {
                setIsScrolling(false);
                window.removeEventListener('scroll', handleScrollComplete);
            }, scrollDuration);

            // 添加一个备用检查，确保即使时间估算不准确也能恢复状态
            backupTimer = setTimeout(() => {
                setIsScrolling(false);
                window.removeEventListener('scroll', handleScrollComplete);
            }, scrollDuration + 1000);

            // 监听滚动事件以检测完成
            window.addEventListener('scroll', handleScrollComplete, { passive: true });
        }
    }, []);

    if (headings.length === 0 || !isWideEnough) {
        return null;
    }

    return (
        <>
            {/* 占位元素，防止内容在 TOC 变为固定定位时跳动 */}
            {isSticky && <div style={{ height: `${containerInfo.initialHeight}px` }} />}

            <div
                id="toc-container"
                className={`transition-all duration-300 ${isSticky ? 'fixed z-10' : 'relative'}`}
                style={{
                    ...(isSticky ? {
                        top: '6rem', // 96px
                        right: 'auto',
                        left: 'auto'
                    } : {
                        // 确保非固定状态时重置所有定位属性
                        position: 'relative',
                        top: 'auto',
                        right: 'auto',
                        left: 'auto'
                    })
                }}
            >
                <div className="bg-card border rounded-lg shadow-sm w-64">
                    {/* 标题栏 */}
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="w-full flex items-center justify-between p-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <span className="flex items-center gap-2">
                            <List className="w-4 h-4" />
                            目录
                        </span>
                        <span className="text-xs">{isExpanded ? '收起' : '展开'}</span>
                    </button>

                    {/* 目录列表 */}
                    {isExpanded && (
                        <nav className={`px-3 pb-3 overflow-y-auto max-h-96`}>
                            <ul className="space-y-1">
                                {headings.map((heading) => (
                                    <li
                                        key={heading.id}
                                        style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
                                    >
                                        <button
                                            onClick={() => handleClick(heading.id)}
                                            className={`
                                                block w-full text-left py-1.5 px-2 text-sm rounded transition-colors
                                                hover:bg-muted/50
                                                ${activeId === heading.id
                                                    ? 'text-primary font-medium bg-primary/10'
                                                    : 'text-muted-foreground'
                                                }
                                            `}
                                        >
                                            <span className="line-clamp-2">{heading.text}</span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </div>
            </div>
        </>
    );
}

export const TocPlugin: ClientPlugin = {
    id: 'toc',
    name: '目录导航插件',
    description: '在文章侧边栏显示目录，支持点击跳转和滚动高亮',
    components: {
        'post-sidebar': TableOfContentsComponent,
    },
    onLoad: () => {
        console.log('TOC Plugin loaded!');
    }
};
