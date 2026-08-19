"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "../styles/admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", exact: true },
    { href: "/admin/products", label: "Products" },
    { href: "/admin/categories", label: "Categories" },
    { href: "/admin/media", label: "Media" },
    { href: "/admin/about", label: "About" },
    { href: "/admin/inquiries", label: "Inquiries" },
  ];

  return (
    <div className="admin-layout">
      {/* 顶部导航栏 */}
      <header className="admin-header">
        <div className="admin-header-left">
          <Link href="/admin" className="admin-logo">
            FOTO<span>BESTWAY</span> ADMIN
          </Link>
          <nav className="admin-nav">
            {navItems.map((item) => {
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={isActive ? "active" : ""}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="admin-header-right">
          <span className="admin-user">Admin</span>
          <Link href="/" className="admin-view-site" target="_blank">
            View Site →
          </Link>
        </div>
      </header>

      {/* 主内容区 */}
      <main className="admin-content">{children}</main>
    </div>
  );
}
