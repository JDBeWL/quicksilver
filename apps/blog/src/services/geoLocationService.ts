// 地理位置服务，用于检测用户所在地区并建议相应语言
export interface LocationInfo {
  country: string;
  countryCode: string;
  city?: string;
  region?: string;
  suggestedLocale: string;
}

// 国家/地区到语言的映射
const COUNTRY_TO_LOCALE: Record<string, string> = {
  // 中文国家和地区
  'CN': 'zh', 'TW': 'zh', 'HK': 'zh', 'MO': 'zh', 'SG': 'zh', 'MY': 'zh',
  // 英文国家和地区
  'US': 'en', 'GB': 'en', 'AU': 'en', 'CA': 'en', 'NZ': 'en', 'IE': 'en',
  'ZA': 'en', 'IN': 'en', 'PH': 'en', 'NG': 'en', 'KE': 'en', 'GH': 'en',
  // 其他默认使用英文
};

// 获取用户地理位置信息（基于IP）
export async function getLocationByIP(): Promise<LocationInfo> {
  try {
    // 使用免费的IP地理位置服务
    const response = await fetch('https://ipapi.co/json/', { 
      signal: AbortSignal.timeout(3000) // 3秒超时
    });
    
    if (!response.ok) {
      throw new Error('IP地理位置服务不可用');
    }
    
    const data = await response.json();
    const countryCode = data.country_code || data.country;
    const country = data.country_name || data.country;
    const city = data.city;
    const region = data.region;
    
    // 根据国家代码确定建议的语言
    const suggestedLocale = COUNTRY_TO_LOCALE[countryCode] || 'en';
    
    return {
      country,
      countryCode,
      city,
      region,
      suggestedLocale
    };
  } catch (error) {
    console.error('获取地理位置失败:', error);
    
    // 返回默认值
    return {
      country: 'Unknown',
      countryCode: 'UN',
      suggestedLocale: 'en'
    };
  }
}

// 使用浏览器地理位置API获取精确位置
export function getBrowserLocation(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理位置API'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => resolve(position),
      error => reject(new Error(`获取地理位置失败: ${error.message}`)),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 86400000 // 24小时缓存
      }
    );
  });
}

// 使用反向地理编码获取位置信息
export async function reverseGeocode(lat: number, lon: number): Promise<LocationInfo> {
  try {
    // 使用免费的Nominatim反向地理编码服务
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=en`,
      {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Quicksilver-Blog/1.0' // 添加User-Agent避免被拒绝
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('反向地理编码服务不可用');
    }
    
    const data = await response.json();
    const address = data.address || {};
    
    // 获取国家代码
    const countryCode = address.country_code?.toUpperCase();
    const country = address.country || 'Unknown';
    const city = address.city || address.town || address.village;
    const region = address.state || address.region;
    
    // 根据国家代码确定建议的语言
    const suggestedLocale = COUNTRY_TO_LOCALE[countryCode] || 'en';
    
    return {
      country,
      countryCode,
      city,
      region,
      suggestedLocale
    };
  } catch (error) {
    console.error('反向地理编码失败:', error);
    
    // 返回默认值
    return {
      country: 'Unknown',
      countryCode: 'UN',
      suggestedLocale: 'en'
    };
  }
}

// 检测用户偏好的语言（综合浏览器和地理位置）
export async function detectUserLanguage(browserLangs: string[]): Promise<{
  locale: string;
  confidence: number;
  source: 'browser' | 'location' | 'default';
  locationInfo?: LocationInfo;
}> {
  // 支持的语言列表
  const supportedLangs = ['en', 'zh'];
  
  // 1. 首先检查浏览器语言偏好
  for (const browserLang of browserLangs) {
    const normalizedLang = browserLang.split('-')[0].toLowerCase(); // 只取语言代码，忽略地区
    if (supportedLangs.includes(normalizedLang)) {
      return {
        locale: normalizedLang,
        confidence: 0.9,
        source: 'browser'
      };
    }
  }
  
  // 2. 浏览器不匹配，尝试地理位置检测
  try {
    const locationInfo = await getLocationByIP();
    
    // 如果地理位置建议的语言受支持，则使用它
    if (supportedLangs.includes(locationInfo.suggestedLocale)) {
      return {
        locale: locationInfo.suggestedLocale,
        confidence: 0.7,
        source: 'location',
        locationInfo
      };
    }
  } catch (error) {
    console.error('地理位置检测失败:', error);
  }
  
  // 3. 所有方法都失败，使用默认语言
  return {
    locale: 'en',
    confidence: 0.5,
    source: 'default'
  };
}