import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, locales } from "./app/i18n/config";

// 后台账号配置（与 /api/admin/login 保持一致）
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const SECRET = process.env.ADMIN_SESSION_SECRET || "fotobestway-admin-session-secret";

// HMAC-SHA256 签名（edge runtime 使用 Web Crypto）
async function sign(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  let binary = "";
  for (let i = 0; i < sig.length; i++) binary += String.fromCharCode(sig[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// 校验会话 cookie
async function checkSession(request: NextRequest): Promise<boolean> {
  const cookie = request.cookies.get("admin_session")?.value;
  if (!cookie) return false;

  const parts = cookie.split(".");
  if (parts.length !== 3) return false;

  const [user, expiry, signature] = parts;
  const exp = Number(expiry);
  if (!exp || Date.now() > exp) return false;
  if (user !== ADMIN_USER) return false;

  const expected = await sign(`${user}.${expiry}`);
  return signature === expected;
}

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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 后台路径会话保护
  if (pathname.startsWith("/admin")) {
    const loggedIn = await checkSession(request);

    // 登录页本身
    if (pathname === "/admin/login") {
      if (loggedIn) {
        // 已登录访问登录页 → 跳回后台
        const url = request.nextUrl.clone();
        url.pathname = "/admin";
        url.search = "";
        return NextResponse.redirect(url);
      }
      return;
    }

    // 其他后台路径：未登录 → 跳转登录页
    if (!loggedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

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
    // 跳过所有带点的路径（静态资源）和 _next，但保留 /admin 用于会话保护
    "/((?!_next|api|images|.*\\..*).*)",
  ],
};
