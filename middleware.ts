import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, locales } from "./app/i18n/config";

// 获取用户偏好的语言
function getLocale(request: NextRequest): string {
  // 1. 先从 cookie 读取
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && locales.includes(cookieLocale as any)) {
    return cookieLocale;
  }

  // 2. 从 Accept-Language header 读取
  const acceptLanguage = request.headers.get("accept-language");
  if (acceptLanguage) {
    const preferredLocales = acceptLanguage
      .split(",")
      .map((lang) => lang.split(";")[0].trim().toLowerCase());

    for (const lang of preferredLocales) {
      // 精确匹配
      if (locales.includes(lang as any)) {
        return lang;
      }
      // 前缀匹配（如 zh-CN → zh）
      const prefix = lang.split("-")[0];
      if (locales.includes(prefix as any)) {
        return prefix;
      }
    }
  }

  // 3. 使用默认语言
  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 检查路径是否已经有 locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // 如果已经有 locale，直接返回
  if (pathnameHasLocale) return;

  // 忽略 API 路由、静态资源、图片等
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/images") ||
    pathname.includes(".")
  ) {
    return;
  }

  // 获取用户偏好的语言
  const locale = getLocale(request);

  // 重定向到带 locale 的路径
  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  matcher: [
    // 跳过所有带点的路径（静态资源）和 _next
    "/((?!_next|api|admin|images|.*\\..*).*)",
  ],
};
