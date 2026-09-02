"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import "../styles/admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [role, setRole] = useState<string>("admin");

  // 读取角色 cookie，用于按角色渲染菜单
  useEffect(() => {
    const m = document.cookie.match(/(?:^|; )admin_role=([^;]*)/);
    setRole(m ? m[1] : "admin");
  }, []);

  const isLimited = role === "limited";

  // limited 角色（内部人员）只允许访问产品列表和询盘
  const canAccess = (href: string) => {
    if (!isLimited) return true;
    return href === "/admin/products" || href.startsWith("/admin/inquiries");
  };

  // 登录页不套后台布局，全屏展示（避免露出后台浅色背景形成白边）
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 退出登录
  async function handleLogout() {
    if (!window.confirm("确定要退出登录吗？")) return;
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch (e) {}
    window.location.href = "/admin/login";
  }

  const navGroups = [
    {
      label: "控制台",
      href: "/admin",
      exact: true,
      children: [],
    },
    {
      label: "产品管理",
      href: "/admin/products",
      children: [
        { href: "/admin/products", label: "产品列表" },
        { href: "/admin/batch-import", label: "批量导入" },
        { href: "/admin/categories", label: "分类管理" },
        { href: "/admin/pdfs", label: "PDF文件上传" },
      ],
    },
    {
      label: "页面内容",
      href: "/admin/media",
      children: [
        { href: "/admin/media", label: "首页内容" },
        { href: "/admin/about", label: "关于页" },
        { href: "/admin/news", label: "新闻管理" },
      ],
    },
    {
      label: "询盘",
      href: "/admin/inquiries",
      exact: true,
      children: [],
    },
  ];

  const isGroupActive = (group: typeof navGroups[0]) => {
    if (group.exact) return pathname === group.href;
    return pathname.startsWith(group.href);
  };

  const isChildActive = (child: { href: string }) => {
    return pathname.startsWith(child.href);
  };

  return (
    <div className="admin-layout">
      {/* 顶部导航栏 */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Link href="/admin" className="admin-logo">
            FOTO<span>BESTWAY</span> ADMIN
          </Link>
          <nav className="admin-nav">
            {navGroups.filter((group) => canAccess(group.href)).map((group) => {
              const active = isGroupActive(group);
              const hasChildren = group.children.length > 0;

              if (!hasChildren) {
                // 单菜单项
                return (
                  <Link
                    key={group.href}
                    href={group.href}
                    className={`admin-nav-item ${active ? "active" : ""}`}
                  >
                    {group.label}
                  </Link>
                );
              }

              // 有下拉的分组
              return (
                <div key={group.href} className="admin-nav-dropdown">
                  <Link
                    href={group.children[0].href}
                    className={`admin-nav-item ${active ? "active" : ""}`}
                  >
                    {group.label} ▾
                  </Link>
                  <div className="admin-dropdown-menu">
                    {group.children.filter((child) => canAccess(child.href)).map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`admin-dropdown-item ${
                          isChildActive(child) ? "active" : ""
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
        <div className="admin-header-right">
          <span className="admin-user">Admin</span>
          <Link href="/" className="admin-view-site" target="_blank">
            查看网站 →
          </Link>
          <button className="admin-logout-btn" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="admin-content">{children}</main>
    </div>
  );
}
