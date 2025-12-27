import matter from 'gray-matter';

// 检查是否在服务器端环境
const isServer = typeof window === 'undefined';

// 动态导入仅在服务器端使用的模块
let fs: typeof import('fs') | undefined;
let path: typeof import('path') | undefined;

try {
    if (isServer) {
        fs = require('fs');
        path = require('path');
    }
} catch (e) {
    // 在客户端环境中，这些模块不可用
}

// 动态计算内容目录路径，支持不同的工作目录
function getContentDirectory() {
    // 只在服务器端执行
    if (!isServer || !path) return '';
    
    // 尝试多个可能的路径
    const possiblePaths = [
        path.join(process.cwd(), 'content/posts'),
        path.join(process.cwd(), '../content/posts'),
        path.join(process.cwd(), '../../content/posts'),
        path.resolve(process.cwd(), 'content/posts'),
        path.resolve(process.cwd(), '../content/posts'),
        path.resolve(process.cwd(), '../../content/posts')
    ];
    
    for (const testPath of possiblePaths) {
        if (fs && fs.existsSync(testPath)) {
            return testPath;
        }
    }
    
    // 如果都找不到，返回默认路径（会在调用时检查是否存在）
    return path.join(process.cwd(), 'content/posts');
}

const contentDirectory = getContentDirectory();

export interface PostData {
    slug: string;
    title: string;
    date: string;
    content: string;
    published: boolean;
    author?: string;
    [key: string]: any;
}

export function getAllPosts(): PostData[] {
    // 只在服务器端执行
    if (!isServer || !fs || !path) return [];
    
    if (!fs.existsSync(contentDirectory)) return [];

    const fileNames = fs.readdirSync(contentDirectory);
    const allPostsData = fileNames
        .filter(fileName => fileName.endsWith('.md'))
        .map(fileName => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(contentDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            return {
                slug,
                content: matterResult.content,
                ...(matterResult.data as { title: string; date: string; published: boolean; author?: string }),
            } as PostData;
        });

    return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPostBySlug(slug: string): PostData | null {
    // 只在服务器端执行
    if (!isServer || !fs || !path) return null;
    
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
        slug,
        content: matterResult.content,
        ...(matterResult.data as { title: string; date: string; published: boolean; author?: string }),
    } as PostData;
}

export function savePost(post: PostData): void {
    // 只在服务器端执行
    if (!isServer || !fs || !path) return;
    
    const fullPath = path.join(contentDirectory, `${post.slug}.md`);
    const { content, slug, ...data } = post;
    const fileContent = matter.stringify(content, data);
    fs.writeFileSync(fullPath, fileContent);
}

export function deletePost(slug: string): void {
    // 只在服务器端执行
    if (!isServer || !fs || !path) return;
    
    const fullPath = path.join(contentDirectory, `${slug}.md`);
    if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
    }
}

// 动态计算页面目录路径，与内容目录逻辑保持一致
function getPagesDirectory() {
    // 只在服务器端执行
    if (!isServer || !path) return '';
    
    // 尝试多个可能的路径
    const possiblePaths = [
        path.join(process.cwd(), 'content/pages'),
        path.join(process.cwd(), '../content/pages'),
        path.join(process.cwd(), '../../content/pages'),
        path.resolve(process.cwd(), 'content/pages'),
        path.resolve(process.cwd(), '../content/pages'),
        path.resolve(process.cwd(), '../../content/pages')
    ];
    
    for (const testPath of possiblePaths) {
        if (fs && fs.existsSync(testPath)) {
            return testPath;
        }
    }
    
    // 如果都找不到，返回默认路径
    return path.join(process.cwd(), 'content/pages');
}

const pagesDirectory = getPagesDirectory();

export function getPageBySlug(slug: string): PostData | null {
    // 只在服务器端执行
    if (!isServer || !fs || !path) return null;
    
    if (!fs.existsSync(pagesDirectory)) return null;
    const fullPath = path.join(pagesDirectory, `${slug}.md`);
    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const matterResult = matter(fileContents);

    return {
        slug,
        content: matterResult.content,
        ...(matterResult.data as { title: string; date: string; published: boolean; author?: string }),
    } as PostData;
}

export function checkPageExists(slug: string): boolean {
    // 只在服务器端执行
    if (!isServer || !fs || !path) return false;
    
    if (!fs.existsSync(pagesDirectory)) return false;
    const fullPath = path.join(pagesDirectory, `${slug}.md`);
    return fs.existsSync(fullPath);
}
