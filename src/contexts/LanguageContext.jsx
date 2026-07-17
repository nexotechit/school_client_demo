'use client';
import React, { createContext, useState, useContext, useEffect } from 'react';
import en from '../locales/en.json';
import bn from '../locales/bn.json';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  // Start with a deterministic default for SSR (always English)
  // and hydrate the user's saved preference on the client in useEffect.
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState(en);

  // On mount, read preference from localStorage and apply it.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedLanguage = localStorage.getItem('language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'bn')) {
      if (savedLanguage !== language) {
        setLanguage(savedLanguage);
        setTranslations(savedLanguage === 'en' ? en : bn);
      }
    }

    // Ensure HTML lang attribute matches initial language (may update later)
    document.documentElement.lang = language === 'en' ? 'en' : 'bn';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep HTML lang attribute in sync when language changes after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language === 'en' ? 'en' : 'bn';
    }
  }, [language]);

  const changeLanguage = (lang) => {
    if (lang === 'en' || lang === 'bn') {
      setLanguage(lang);
      setTranslations(lang === 'en' ? en : bn);
      localStorage.setItem('language', lang);
      
      // Update HTML lang attribute for accessibility
      document.documentElement.lang = lang === 'en' ? 'en' : 'bn';
    }
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return key if translation not found
        return key;
      }
    }
    
    return value;
  };

  const value = {
    language,
    changeLanguage,
    t,
    isEnglish: language === 'en',
    isBangla: language === 'bn'
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
