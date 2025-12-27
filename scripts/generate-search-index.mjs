#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import matter from 'gray-matter';
import { getAllPosts } from '@quicksilver/content-core';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 切换到项目根目录（scripts 的父目录就是项目根目录）
process.chdir(path.resolve(__dirname, '..'));

// 生成搜索索引
function generateSearchIndex() {
  console.log('Generating search index...');
  
  // 调试信息：输出当前工作目录和内容目录
  console.log(`Current working directory: ${process.cwd()}`);
  
  // 获取所有文章
  const posts = getAllPosts();
  console.log(`Found ${posts.length} posts`);
  
  // 如果没有找到文章，尝试直接使用绝对路径
  if (posts.length === 0) {
    console.log('No posts found, trying alternative path...');
    try {
      // 尝试直接使用绝对路径读取文章
      const directContentDir = path.resolve(process.cwd(), 'content/posts');
      console.log(`Trying direct path: ${directContentDir}`);
      
      if (fs.existsSync(directContentDir)) {
        const fileNames = fs.readdirSync(directContentDir);
        console.log(`Found files in directory: ${fileNames.join(', ')}`);
        
        const directPosts = fileNames
          .filter(fileName => fileName.endsWith('.md'))
          .map(fileName => {
            const slug = fileName.replace(/\.md$/, '');
            const fullPath = path.join(directContentDir, fileName);
            const fileContents = fs.readFileSync(fullPath, 'utf8');
            const matterResult = matter(fileContents);

            return {
              slug,
              title: matterResult.data.title || slug,
              date: matterResult.data.date || new Date().toISOString(),
              content: matterResult.content,
              published: matterResult.data.published !== false,
              author: matterResult.data.author || 'Unknown',
            };
          });
          
        console.log(`Direct method found ${directPosts.length} posts`);
        return processPosts(directPosts);
      }
    } catch (error) {
      console.error('Error with direct method:', error);
    }
  }
  
  // 提取需要的字段并生成索引
  const searchIndex = processPosts(posts);
  
  // 确保目录存在
  const publicDataDir = path.join(process.cwd(), 'apps/blog/public/data');
  if (!fs.existsSync(publicDataDir)) {
    fs.mkdirSync(publicDataDir, { recursive: true });
  }
  
  // 写入搜索索引文件
  const indexPath = path.join(publicDataDir, 'search-index.json');
  fs.writeFileSync(indexPath, JSON.stringify(searchIndex, null, 2));
  
  console.log(`Search index generated successfully at ${indexPath}`);
  console.log(`Indexed ${searchIndex.length} published posts`);
}

// 处理文章数据，生成搜索索引
function processPosts(posts) {
  return posts
    .filter(post => post.published !== false) // 只索引已发布的文章
    .map(post => ({
      id: post.slug,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || extractExcerpt(post.content),
      content: post.content,
      date: post.date,
      author: post.author
    }));
}

// 从内容中提取摘要
function extractExcerpt(content, maxLength = 150) {
  // 移除 Markdown 格式字符
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 标题
    .replace(/\*\*/g, '') // 粗体
    .replace(/\*/g, '') // 斜体
    .replace(/`{1,3}[^`]*`{1,3}/g, '') // 代码块
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接
    .replace(/!\w+\([^)]+\)/g, '') // 图片
    .replace(/~~/g, '') // 删除线
    .replace(/^\s*>\s*/gm, '') // 引用
    .replace(/^\s*[-+*]\s+/gm, '') // 无序列表
    .replace(/^\s*\d+\.\s+/gm, '') // 有序列表
    .trim();
  
  // 截取指定长度
  if (plainText.length <= maxLength) {
    return plainText;
  }
  
  // 在单词边界处截断
  const truncated = plainText.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  return lastSpaceIndex > 0 
    ? truncated.substring(0, lastSpaceIndex) + '...'
    : truncated + '...';
}

// 执行生成
generateSearchIndex();
