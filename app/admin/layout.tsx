"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import "../styles/admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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
            {navGroups.map((group) => {
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
                    {group.children.map((child) => (
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
        </div>
      </header>

      {/* 主内容区 */}
      <main className="admin-content">{children}</main>
    </div>
  );
}
