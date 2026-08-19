// i18n 配置
export const locales = ["en", "zh", "ar"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

// 语言显示名称
export const localeNames: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  ar: "العربية",
};

// RTL 语言（从右到左）
export const rtlLocales: Locale[] = []; // 暂时取消 RTL，所有语言都用 LTR 布局

// 判断是否是 RTL 语言
export function isRtl(locale: string): boolean {
  return rtlLocales.includes(locale as Locale);
}

// 获取语言方向
export function getDirection(locale: string): "ltr" | "rtl" {
  return isRtl(locale) ? "rtl" : "ltr";
}
