'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Locale } from '@/i18n-config';
import { LocationInfo, detectUserLanguage } from '@/services/geoLocationService';

// 支持的语言配置
export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' }
] as const;

// 语言状态接口
interface LanguageState {
  currentLanguage: Locale;
  detectedLanguage: Locale | null;
  userPreference: Locale | null;
  locationInfo: LocationInfo | null;
  isLoading: boolean;
  hasLocationPermission: boolean;
  languageDetectionSource: 'browser' | 'location' | 'default' | null;
}

// 动作类型
type LanguageAction = 
  | { type: 'SET_LANGUAGE'; payload: Locale }
  | { type: 'SET_USER_PREFERENCE'; payload: Locale }
  | { type: 'SET_DETECTED_LANGUAGE'; payload: { language: Locale; source: 'browser' | 'location' | 'default'; locationInfo?: LocationInfo } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_LOCATION_PERMISSION'; payload: boolean };

// 初始状态
const initialState: LanguageState = {
  currentLanguage: 'en',
  detectedLanguage: null,
  userPreference: null,
  locationInfo: null,
  isLoading: true,
  hasLocationPermission: false,
  languageDetectionSource: null
};

// Reducer
function languageReducer(state: LanguageState, action: LanguageAction): LanguageState {
  switch (action.type) {
    case 'SET_LANGUAGE':
      return { ...state, currentLanguage: action.payload };
    case 'SET_USER_PREFERENCE':
      return { ...state, userPreference: action.payload };
    case 'SET_DETECTED_LANGUAGE':
      return { 
        ...state, 
        detectedLanguage: action.payload.language,
        languageDetectionSource: action.payload.source,
        locationInfo: action.payload.locationInfo || null
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_LOCATION_PERMISSION':
      return { ...state, hasLocationPermission: action.payload };
    default:
      return state;
  }
}

// Context类型
interface LanguageContextType {
  state: LanguageState;
  changeLanguage: (lang: Locale) => void;
  setUserPreference: (lang: Locale) => void;
  detectUserLanguagePreference: () => Promise<void>;
  requestLocationPermission: () => Promise<void>;
  getLanguageName: (code: string) => string;
}

// 创建上下文
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Provider组件
interface LanguageProviderProps {
  children: ReactNode;
  initialLanguage: Locale;
}

export function LanguageProvider({ children, initialLanguage }: LanguageProviderProps) {
  const [state, dispatch] = useReducer(languageReducer, {
    ...initialState,
    currentLanguage: initialLanguage
  });

  // 更改当前语言
  const changeLanguage = (lang: Locale) => {
    dispatch({ type: 'SET_LANGUAGE', payload: lang });
  };

  // 设置用户偏好语言
  const setUserPreference = (lang: Locale) => {
    dispatch({ type: 'SET_USER_PREFERENCE', payload: lang });
    
    // 保存到本地存储
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', lang);
      
      // 设置Cookie
      document.cookie = `preferred-language=${lang}; max-age=${60 * 60 * 24 * 365}; path=/; sameSite=lax`;
    }
  };

  // 检测用户语言偏好
  const detectUserLanguagePreference = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // 获取浏览器语言列表
      const browserLanguages = Array.from(navigator.languages || [navigator.language]);
      
      // 使用综合检测方法
      const detection = await detectUserLanguage(browserLanguages);
      
      dispatch({
        type: 'SET_DETECTED_LANGUAGE',
        payload: {
          language: detection.locale as Locale,
          source: detection.source,
          locationInfo: detection.locationInfo
        }
      });
      
      // 如果用户没有设置过偏好，且检测到的语言与当前不同，则建议切换
      if (!state.userPreference && detection.locale !== state.currentLanguage) {
        // 这里可以显示一个提示，询问用户是否切换到检测到的语言
        console.log(`检测到推荐语言: ${detection.locale} (来源: ${detection.source})`);
      }
    } catch (error) {
      console.error('语言检测失败:', error);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // 请求地理位置权限
  const requestLocationPermission = async () => {
    try {
      if (!navigator.geolocation) {
        console.warn('浏览器不支持地理位置API');
        return;
      }
      
      // 检查权限状态
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      
      if (permission.state === 'granted') {
        dispatch({ type: 'SET_LOCATION_PERMISSION', payload: true });
      } else if (permission.state === 'prompt') {
        // 请求权限
        navigator.geolocation.getCurrentPosition(
          () => dispatch({ type: 'SET_LOCATION_PERMISSION', payload: true }),
          () => dispatch({ type: 'SET_LOCATION_PERMISSION', payload: false })
        );
      } else {
        dispatch({ type: 'SET_LOCATION_PERMISSION', payload: false });
      }
    } catch (error) {
      console.error('获取地理位置权限失败:', error);
      dispatch({ type: 'SET_LOCATION_PERMISSION', payload: false });
    }
  };

  // 获取语言显示名称
  const getLanguageName = (code: string): string => {
    const language = SUPPORTED_LANGUAGES.find(lang => lang.code === code);
    return language ? language.name : code;
  };

  // 初始化语言设置
  useEffect(() => {
    // 从本地存储恢复用户偏好
    if (typeof window !== 'undefined') {
      const savedPreference = localStorage.getItem('preferred-language') as Locale;
      if (savedPreference && SUPPORTED_LANGUAGES.some(lang => lang.code === savedPreference)) {
        setUserPreference(savedPreference);
        changeLanguage(savedPreference);
      }
      
      // 检测用户语言偏好
      detectUserLanguagePreference();
    }
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        state,
        changeLanguage,
        setUserPreference,
        detectUserLanguagePreference,
        requestLocationPermission,
        getLanguageName
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

// Hook使用上下文
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}