import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { defaultLocale, locales } from "./app/i18n/config";
import { checkSession } from "./app/lib/auth";

// 后台账号配置（与 /api/admin/login 保持一致）
const ADMIN_USER = process.env.ADMIN_USER || "admin";

export async function proxy(request: NextRequest) {
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
  const locale = defaultLocale;

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
