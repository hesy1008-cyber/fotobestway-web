"use client";

import { createContext, useContext } from "react";
import type { Messages } from "./messages";

// 翻译上下文
const TranslationContext = createContext<Messages | null>(null);

// 翻译上下文 Provider
export function TranslationProvider({
  messages,
  children,
}: {
  messages: Messages;
  children: React.ReactNode;
}) {
  return (
    <TranslationContext.Provider value={messages}>
      {children}
    </TranslationContext.Provider>
  );
}

// 使用翻译的 hook
export function useTranslations() {
  const messages = useContext(TranslationContext);
  if (!messages) {
    throw new Error("useTranslations must be used within a TranslationProvider");
  }
  return messages;
}
