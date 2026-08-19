import { defaultLocale, type Locale } from "./config";
import en from "./messages/en";
import zh from "./messages/zh";
import ar from "./messages/ar";

// 所有翻译消息
const messages: Record<Locale, typeof en> = {
  en,
  zh,
  ar,
};

// 获取指定语言的翻译消息
export function getMessages(locale: string) {
  return messages[locale as Locale] || messages[defaultLocale];
}

// 类型定义
export type Messages = typeof en;
