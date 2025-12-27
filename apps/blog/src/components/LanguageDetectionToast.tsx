'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage, SUPPORTED_LANGUAGES } from '@/context/LanguageContext';
import { LanguageDetectionToast } from './LanguageSwitcher';
import { StorageService } from '@/services/storageService';

export default function LanguageDetectionToastContainer() {
  const { state, changeLanguage, setUserPreference } = useLanguage();
  const [showToast, setShowToast] = useState(false);
  const [suggestedLanguage, setSuggestedLanguage] = useState<string | null>(null);

  useEffect(() => {
    // 当语言检测完成且用户没有明确偏好时，检查是否需要显示提示
    if (
      !state.isLoading && 
      state.detectedLanguage && 
      state.detectedLanguage !== state.currentLanguage &&
      !state.userPreference &&
      !StorageService.isLanguageSuggestionDismissed(state.detectedLanguage)
    ) {
      // 获取地理位置建议的语言
      const geoSuggestedLang = StorageService.getGeoSuggestedLanguage();
      
      // 如果地理位置建议的语言与当前语言不同，则显示提示
      if (geoSuggestedLang && geoSuggestedLang !== state.currentLanguage) {
        setSuggestedLanguage(geoSuggestedLang);
        setShowToast(true);
      }
      // 或者如果检测到的浏览器语言与当前语言不同，也显示提示
      else if (state.languageDetectionSource === 'browser') {
        setSuggestedLanguage(state.detectedLanguage);
        setShowToast(true);
      }
    }
  }, [state]);

  // 处理用户接受语言建议
  const handleAcceptSuggestion = () => {
    if (suggestedLanguage) {
      changeLanguage(suggestedLanguage as 'en' | 'zh');
      setUserPreference(suggestedLanguage as 'en' | 'zh');
      
      // 重新加载页面以应用新语言
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0 && SUPPORTED_LANGUAGES.some(lang => lang.code === pathSegments[0])) {
        pathSegments[0] = suggestedLanguage;
      } else {
        pathSegments.unshift(suggestedLanguage);
      }
      
      const newPath = '/' + pathSegments.join('/');
      window.location.href = newPath;
    }
    setShowToast(false);
  };

  // 处理用户忽略语言建议
  const handleDismissSuggestion = () => {
    if (suggestedLanguage) {
      StorageService.dismissLanguageSuggestion(suggestedLanguage as 'en' | 'zh');
    }
    setShowToast(false);
  };

  if (!showToast || !suggestedLanguage) {
    return null;
  }

  const suggestedLangInfo = SUPPORTED_LANGUAGES.find(
    lang => lang.code === suggestedLanguage
  ) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageDetectionToast
      onAccept={handleAcceptSuggestion}
      onDismiss={handleDismissSuggestion}
      suggestedLanguage={suggestedLanguage}
      languageName={suggestedLangInfo.name}
      flag={suggestedLangInfo.flag}
    />
  );
}