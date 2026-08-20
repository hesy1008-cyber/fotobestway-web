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

  // 英文时导航文字转大写
  const upper = (text: string) => locale === "en" ? text.toUpperCase() : text;

  return (
    <header className="header" data-locale={locale}>
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
          {upper(t.nav.home)}
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
            {upper(t.nav.products)}
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
          href={withLocale("/news", locale)}
          className={pathWithoutLocale === "/news" ? "active" : ""}
        >
          {upper(locale === "zh" ? "新闻" : "NEWS")}
        </Link>

        <Link
          href={withLocale("/about", locale)}
          className={pathWithoutLocale === "/about" ? "active" : ""}
        >
          {upper(t.nav.about)}
        </Link>

        <Link href={withLocale("/support", locale)}>
          {upper(t.nav.support)}
        </Link>

        <Link
          href={withLocale("/contact", locale)}
          className={pathWithoutLocale === "/contact" ? "active" : ""}
        >
          {upper(t.nav.contact)}
        </Link>
      </nav>

      <div className="headerRight">
        {/* 社媒图标 - 圆形白底黑图标 */}
        <div className="headerSocialIcons" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <a
            href="https://www.facebook.com/profile.php?id=61561703761081"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="headerSocialIcon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#fff",
              color: "#111",
              textDecoration: "none",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/fotobestway/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="headerSocialIcon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#fff",
              color: "#111",
              textDecoration: "none",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
          </a>
          <a
            href="https://www.youtube.com/@fotobestwayphotovideo"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="headerSocialIcon"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#fff",
              color: "#111",
              textDecoration: "none",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.15)"; e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.opacity = "1"; }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
          </a>
        </div>

        <span className="searchIcon">
          ⌕
        </span>

        <LanguageSwitcher />
      </div>
    </header>
  );
}
