"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "zh" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 翻译文件
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    "nav.home": "Home",
    "nav.products": "Products",
    "nav.about": "About",
    "nav.support": "Support",
    "nav.contact": "Contact",

    // Common
    "common.search": "Search",
    "common.language": "Language",
  },
  zh: {
    // Nav
    "nav.home": "首页",
    "nav.products": "产品",
    "nav.about": "关于我们",
    "nav.support": "技术支持",
    "nav.contact": "联系我们",

    // Common
    "common.search": "搜索",
    "common.language": "语言",
  },
  ar: {
    // Nav
    "nav.home": "الرئيسية",
    "nav.products": "المنتجات",
    "nav.about": "من نحن",
    "nav.support": "الدعم الفني",
    "nav.contact": "اتصل بنا",

    // Common
    "common.search": "بحث",
    "common.language": "اللغة",
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  // 语言变化时更新 html lang 属性
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.lang = language;
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
