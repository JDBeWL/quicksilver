'use client';

import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';

interface LanguageProviderWrapperProps {
  children: React.ReactNode;
  initialLanguage: string;
}

export default function LanguageProviderWrapper({ 
  children, 
  initialLanguage 
}: LanguageProviderWrapperProps) {
  return (
    <LanguageProvider initialLanguage={initialLanguage as 'en' | 'zh'}>
      {children}
    </LanguageProvider>
  );
}