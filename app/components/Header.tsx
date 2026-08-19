"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from "@/app/i18n/TranslationContext";
import { locales, type Locale } from "@/app/i18n/config";

type SubCategory = {
  id: string;
  name: string;
  slug: string;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  bannerImage: string | null;
  subCategories: SubCategory[];
};

// 从 pathname 获取当前 locale
function getLocaleFromPathname(pathname: string | null): Locale {
  if (!pathname) return "en";
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      return locale;
    }
  }
  return "en";
}

// 给路径加上 locale 前缀
function withLocale(path: string, locale: Locale): string {
  return `/${locale}${path === "/" ? "" : path}`;
}

export default function Header({
  categories = [],
}: {
  categories?: Category[];
}) {
  const pathname = usePathname();
  const t = useTranslations();
  const locale = getLocaleFromPathname(pathname);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

  // 去掉 locale 前缀的路径，用于判断 active 状态
  const pathWithoutLocale = pathname
    ? pathname.replace(/^\/(en|zh|ar)(\/|$)/, "/")
    : "/";

  return (
    <header className="header">
      <Link href={withLocale("/", locale)} className="logo">
        <Image
          src="/Logo.png"
          alt="Fotobestway"
          width={170}
          height={65}
          priority
        />
      </Link>

      <nav className="nav">
        <Link
          href={withLocale("/", locale)}
          className={pathWithoutLocale === "/" ? "active" : ""}
        >
          {t.nav.home}
        </Link>

        {/* Products with Mega Menu */}
        <div
          className={`nav-item-with-mega ${
            pathWithoutLocale.startsWith("/products") ? "active" : ""
          }`}
          onMouseEnter={() => setMegaMenuOpen(true)}
          onMouseLeave={() => setMegaMenuOpen(false)}
        >
          <Link
            href={withLocale("/products", locale)}
            className={pathWithoutLocale.startsWith("/products") ? "active" : ""}
          >
            {t.nav.products}
            <span className="mega-arrow">▾</span>
          </Link>

          {megaMenuOpen && categories.length > 0 && (
            <div className="mega-menu">
              <div className="mega-menu-inner">
                {categories.map((category) => {
                  // 优先用翻译文件里的分类名称
                  const categoryName = t.categories[category.slug as keyof typeof t.categories] || category.name;
                  
                  return (
                    <div key={category.id} className="mega-column">
                      <Link
                        href={`${withLocale("/products", locale)}?category=${category.slug}`}
                        className="mega-category-header"
                      >
                        <h4>{categoryName}</h4>
                      </Link>

                      <ul className="mega-sub-list">
                        {category.subCategories.slice(0, 6).map((sub) => (
                          <li key={sub.id}>
                            <Link
                              href={`${withLocale("/products", locale)}?category=${category.slug}&subCategory=${sub.slug}`}
                            >
                              {(t.subCategories as Record<string, Record<string, string>>)[category.slug]?.[sub.slug] || sub.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <Link
          href={withLocale("/about", locale)}
          className={pathWithoutLocale === "/about" ? "active" : ""}
        >
          {t.nav.about}
        </Link>

        <Link href={withLocale("/support", locale)}>
          {t.nav.support}
        </Link>

        <Link
          href={withLocale("/contact", locale)}
          className={pathWithoutLocale === "/contact" ? "active" : ""}
        >
          {t.nav.contact}
        </Link>
      </nav>

      <div className="headerRight">
        <span className="searchIcon">
          ⌕
        </span>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
