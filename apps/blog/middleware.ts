import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from './src/i18n-config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

// 获取匹配的语言区域
function getLocale(request: NextRequest): string | undefined {
  // 从查询参数中获取语言设置
  const searchParams = request.nextUrl.searchParams.get('lang');
  if (searchParams && i18n.locales.includes(searchParams as any)) {
    return searchParams;
  }

  // 从Cookie中获取用户之前选择的语言
  if (request.cookies.has('preferred-language')) {
    const cookieLang = request.cookies.get('preferred-language')?.value;
    if (cookieLang && i18n.locales.includes(cookieLang as any)) {
      return cookieLang;
    }
  }

  // 从Accept-Language头中解析浏览器偏好语言
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => (negotiatorHeaders[key] = value));
  
  // 调试日志，输出Accept-Language头信息
  console.log('Accept-Language header:', request.headers.get('accept-language'));
  
  // 获取所有支持的语言匹配
  let languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  console.log('Negotiator languages:', languages);
  
  // 将 Accept-Language 中的区域变体映射到我们的支持语言
  const mappedLanguages = languages.map(lang => {
    // 将 zh-CN, zh-TW 等映射为 zh
    if (lang.startsWith('zh-')) return 'zh';
    // 将 en-US, en-GB 等映射为 en
    if (lang.startsWith('en-')) return 'en';
    return lang;
  });
  
  // 尝试匹配支持的语言
  try {
    const locale = matchLocale(mappedLanguages, i18n.locales, i18n.defaultLocale);
    console.log('Mapped languages:', mappedLanguages);
    console.log('Matched locale:', locale);
    return locale;
  } catch (error) {
    console.error('Error matching locale:', error);
    return i18n.defaultLocale;
  }
}

// 支持的语言列表，用于地理位置映射
const SUPPORTED_LOCALES = ['en', 'zh'];
const COUNTRY_TO_LOCALE: Record<string, string> = {
  // 中文国家和地区
  'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'MO': 'zh', 'SG': 'zh', 'MY': 'zh',
  // 英文国家和地区（默认，不需要明确列出）
  // 'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', etc.
};

// 获取用户地理位置信息（基于IP）
async function getLocationByIP(): Promise<string> {
  try {
    // 使用免费的IP地理位置服务
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(2000) // 2秒超时
    });
    
    if (!response.ok) {
      throw new Error('IP地理位置服务不可用');
    }
    
    const data = await response.json();
    const countryCode = data.country_code || data.country;
    
    if (countryCode && COUNTRY_TO_LOCALE[countryCode]) {
      return COUNTRY_TO_LOCALE[countryCode];
    }
  } catch (error) {
    console.error('获取地理位置失败:', error);
  }
  
  // 默认返回英文
  return 'en';
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // 检查路径是否已包含语言前缀
  const pathnameIsMissingLocale = i18n.locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // 如果路径已包含语言前缀，直接继续
  if (!pathnameIsMissingLocale) {
    return NextResponse.next();
  }

  // 获取首选语言（优先级：查询参数 > Cookie > 浏览器Accept-Language）
  const locale = getLocale(request) || i18n.defaultLocale;
  console.log('Final detected locale:', locale);
  
  // 创建重定向响应，并添加地理位置检测标记
  const response = NextResponse.redirect(
    new URL(`/${locale}${pathname}`, request.url)
  );
  
  // 如果是首次访问，添加地理位置检测标记
  if (!request.cookies.has('geo-language-detected')) {
    response.cookies.set('geo-language-detected', 'true', {
      maxAge: 60 * 60 * 24, // 24小时
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
    });
  }
  
  return response;
}

export const config = {
  // 匹配除了静态资源外的所有路径
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};