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

// 校验会话 cookie，返回角色（admin/limited），无效返回空字符串
async function checkSession(request: NextRequest): Promise<string> {
  const cookie = request.cookies.get("admin_session")?.value;
  if (!cookie) return "";

  const parts = cookie.split(".");
  if (parts.length !== 4) return "";

  const [user, role, expiry, signature] = parts;
  const exp = Number(expiry);
  if (!exp || Date.now() > exp) return "";

  const expected = await sign(`${user}.${role}.${expiry}`);
  return signature === expected ? role : "";
}

// 获取用户偏好的语言
function getLocale(request: NextRequest): string {
  // 一律默认英文，不做浏览器语言检测、不记忆用户选择；
  // 需要中文/阿拉伯语的用户手动在页面右上角切换
  return defaultLocale;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 后台路径会话保护
  if (pathname.startsWith("/admin")) {
    const role = await checkSession(request);

    // 登录页本身
    if (pathname === "/admin/login") {
      if (role) {
        // 已登录访问登录页 → 跳回对应首页
        const url = request.nextUrl.clone();
        url.pathname = role === "limited" ? "/admin/products" : "/admin";
        url.search = "";
        return NextResponse.redirect(url);
      }
      return;
    }

    // 其他后台路径：未登录 → 跳转登录页
    if (!role) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }

    // limited 角色（内部人员）只允许访问产品列表和询盘
    if (role === "limited") {
      const allowed =
        pathname === "/admin/products" ||
        pathname === "/admin/products/" ||
        pathname.startsWith("/admin/inquiries");
      if (!allowed) {
        const url = request.nextUrl.clone();
        url.pathname = "/admin/products";
        url.search = "";
        return NextResponse.redirect(url);
      }
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
