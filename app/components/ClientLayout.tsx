"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Header from "./Header";
import { InquiryCartProvider } from "@/app/contexts/InquiryCartContext";
import InquiryDrawer from "./InquiryDrawer";

export default function ClientLayout({
  children,
  categories,
  locale,
  direction,
}: {
  children: React.ReactNode;
  categories: any[];
  locale?: string;
  direction?: "ltr" | "rtl";
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  // 设置 html 的 lang 和 dir 属性
  useEffect(() => {
    if (locale) {
      document.documentElement.lang = locale;
    }
    if (direction) {
      document.documentElement.dir = direction;
    }
  }, [locale, direction]);

  return (
    <InquiryCartProvider>
      {!isAdmin && <Header categories={categories} />}
      {children}
      {!isAdmin && <InquiryDrawer />}
    </InquiryCartProvider>
  );
}
