"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { locales, localeNames, type Locale } from "@/app/i18n/config";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // 获取当前语言
  const currentLocale = locales.find((locale) =>
    pathname?.startsWith(`/${locale}`)
  ) || "en";

  // 生成切换语言的链接
  function getPathForLocale(locale: Locale): string {
    if (!pathname) return `/${locale}`;

    // 移除当前语言前缀
    const pathWithoutLocale = pathname.replace(
      /^\/(en|zh|ar)(\/|$)/,
      "/"
    );

    // 添加新的语言前缀
    return `/${locale}${pathWithoutLocale === "/" ? "" : pathWithoutLocale}`;
  }

  return (
    <div className="language-switcher">
      <button
        className="language-switcher-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {localeNames[currentLocale]}
        <span className="language-switcher-arrow">▼</span>
      </button>

      {isOpen && (
        <div className="language-switcher-dropdown">
          {locales.map((locale) => (
            <Link
              key={locale}
              href={getPathForLocale(locale)}
              className={`language-switcher-option ${
                locale === currentLocale ? "active" : ""
              }`}
              onClick={() => setIsOpen(false)}
            >
              {localeNames[locale]}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
