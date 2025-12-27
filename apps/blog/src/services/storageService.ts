'use client';

import { Locale } from '@/i18n-config';

// 存储键名
const STORAGE_KEYS = {
  PREFERRED_LANGUAGE: 'preferred-language',
  LANGUAGE_DETECTION_SOURCES: 'language-detection-sources',
  GEO_LANGUAGE_DETECTED: 'geo-language-detected',
  GEO_SUGGESTED_LANGUAGE: 'geo-suggested-language',
  LOCATION_PERMISSION_REQUESTED: 'location-permission-requested',
  DISMISSED_LANGUAGE_SUGGESTIONS: 'dismissed-language-suggestions'
} as const;

// 语言检测历史记录
interface LanguageDetectionHistory {
  timestamp: number;
  source: 'browser' | 'location' | 'default';
  detectedLanguage: Locale;
  userAgent?: string;
  locationInfo?: {
    country: string;
    countryCode: string;
    city?: string;
    region?: string;
  };
}

// 存储服务类
export class StorageService {
  // 获取用户偏好语言
  static getPreferredLanguage(): Locale | null {
    if (typeof window === 'undefined') return null;
    
    // 优先从Cookie获取
    const cookieMatch = document.cookie.match(
      new RegExp(`(^| )${STORAGE_KEYS.PREFERRED_LANGUAGE}=([^;]+)`)
    );
    
    if (cookieMatch) {
      return cookieMatch[2] as Locale;
    }
    
    // 从LocalStorage获取
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERRED_LANGUAGE);
      if (stored) {
        return stored as Locale;
      }
    } catch (error) {
      console.error('读取LocalStorage失败:', error);
    }
    
    return null;
  }

  // 保存用户偏好语言
  static savePreferredLanguage(language: Locale): void {
    if (typeof window === 'undefined') return;
    
    // 保存到Cookie (一年有效期)
    document.cookie = `${STORAGE_KEYS.PREFERRED_LANGUAGE}=${language}; max-age=${60 * 60 * 24 * 365}; path=/; sameSite=lax`;
    
    // 保存到LocalStorage
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERRED_LANGUAGE, language);
    } catch (error) {
      console.error('保存到LocalStorage失败:', error);
    }
  }

  // 记录语言检测历史
  static recordLanguageDetection(history: LanguageDetectionHistory): void {
    if (typeof window === 'undefined') return;
    
    try {
      const existingHistory = this.getLanguageDetectionHistory();
      // 保持最多10条记录
      const updatedHistory = [history, ...existingHistory].slice(0, 10);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE_DETECTION_SOURCES, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('保存语言检测历史失败:', error);
    }
  }

  // 获取语言检测历史
  static getLanguageDetectionHistory(): LanguageDetectionHistory[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LANGUAGE_DETECTION_SOURCES);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('读取语言检测历史失败:', error);
      return [];
    }
  }

  // 记录地理位置语言检测
  static recordGeoLanguageDetection(detected: boolean, suggestedLanguage?: string): void {
    if (typeof window === 'undefined') return;
    
    try {
      if (detected) {
        localStorage.setItem(STORAGE_KEYS.GEO_LANGUAGE_DETECTED, 'true');
        if (suggestedLanguage) {
          localStorage.setItem(STORAGE_KEYS.GEO_SUGGESTED_LANGUAGE, suggestedLanguage);
        }
      }
    } catch (error) {
      console.error('记录地理位置语言检测失败:', error);
    }
  }

  // 检查是否已进行过地理位置语言检测
  static hasGeoLanguageBeenDetected(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.GEO_LANGUAGE_DETECTED) === 'true';
    } catch (error) {
      console.error('检查地理位置语言检测状态失败:', error);
      return false;
    }
  }

  // 获取地理位置建议的语言
  static getGeoSuggestedLanguage(): string | null {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.GEO_SUGGESTED_LANGUAGE);
    } catch (error) {
      console.error('获取地理位置建议语言失败:', error);
      return null;
    }
  }

  // 记录是否已请求过地理位置权限
  static setLocationPermissionRequested(): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION_PERMISSION_REQUESTED, 'true');
    } catch (error) {
      console.error('记录地理位置权限请求状态失败:', error);
    }
  }

  // 检查是否已请求过地理位置权限
  static hasLocationPermissionBeenRequested(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      return localStorage.getItem(STORAGE_KEYS.LOCATION_PERMISSION_REQUESTED) === 'true';
    } catch (error) {
      console.error('检查地理位置权限请求状态失败:', error);
      return false;
    }
  }

  // 记录用户已忽略的语言建议
  static dismissLanguageSuggestion(language: Locale): void {
    if (typeof window === 'undefined') return;
    
    try {
      const dismissed = this.getDismissedLanguageSuggestions();
      // 如果没有记录过该语言的建议，或者上次记录超过30天，则添加
      const existingIndex = dismissed.findIndex(item => item.language === language);
      const now = Date.now();
      
      if (existingIndex >= 0) {
        dismissed[existingIndex] = { language, timestamp: now };
      } else {
        dismissed.push({ language, timestamp: now });
      }
      
      localStorage.setItem(STORAGE_KEYS.DISMISSED_LANGUAGE_SUGGESTIONS, JSON.stringify(dismissed));
    } catch (error) {
      console.error('记录忽略的语言建议失败:', error);
    }
  }

  // 获取用户已忽略的语言建议
  static getDismissedLanguageSuggestions(): { language: Locale; timestamp: number }[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DISMISSED_LANGUAGE_SUGGESTIONS);
      const dismissed = stored ? JSON.parse(stored) : [];
      
      // 过滤掉超过30天的记录
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      return dismissed.filter((item: { language: Locale; timestamp: number }) => 
        item.timestamp > thirtyDaysAgo
      );
    } catch (error) {
      console.error('获取忽略的语言建议失败:', error);
      return [];
    }
  }

  // 检查特定语言建议是否已被忽略
  static isLanguageSuggestionDismissed(language: Locale): boolean {
    const dismissed = this.getDismissedLanguageSuggestions();
    return dismissed.some(item => item.language === language);
  }

  // 清理过期的存储数据
  static cleanupExpiredData(): void {
    if (typeof window === 'undefined') return;
    
    try {
      // 清理地理位置检测记录（超过24小时）
      const geoDetected = localStorage.getItem(STORAGE_KEYS.GEO_LANGUAGE_DETECTED);
      if (geoDetected === 'true') {
        // 获取记录时间戳（实际存储时需要一起保存时间戳）
        // 这里简化处理，假设超过一天就过期
        // 实际实现中应该保存完整的时间戳
      }
      
      // 清理语言检测历史（保留最近30天）
      const history = this.getLanguageDetectionHistory();
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const filteredHistory = history.filter(item => item.timestamp > thirtyDaysAgo);
      localStorage.setItem(STORAGE_KEYS.LANGUAGE_DETECTION_SOURCES, JSON.stringify(filteredHistory));
      
      // 清理已忽略的建议（已在getDismissedLanguageSuggestions中处理）
      this.getDismissedLanguageSuggestions();
    } catch (error) {
      console.error('清理过期数据失败:', error);
    }
  }
}

// 导出便捷函数
export const {
  getPreferredLanguage,
  savePreferredLanguage,
  recordLanguageDetection,
  getLanguageDetectionHistory,
  recordGeoLanguageDetection,
  hasGeoLanguageBeenDetected,
  getGeoSuggestedLanguage,
  setLocationPermissionRequested,
  hasLocationPermissionBeenRequested,
  dismissLanguageSuggestion,
  getDismissedLanguageSuggestions,
  isLanguageSuggestionDismissed,
  cleanupExpiredData
} = StorageService;