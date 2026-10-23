import type { Metadata } from "next";
import { TranslationProvider } from "@/app/i18n/TranslationContext";
import { getMessages } from "@/app/i18n/messages";
import "./globals.css";
import "./styles/layout.css";
import "./styles/header.css";
import "./styles/home.css";
import "./styles/categories.css";
import "./styles/products.css";
import "./styles/detail.css";
import "./styles/footer.css";
import "./styles/admin.css";
import "./styles/contact.css";
import "./styles/support.css";
import "./styles/inquiry.css";

export const metadata: Metadata = {
  title: "Fotobestway",
  description: "Professional Photography Equipment",
  // 社交分享图（OG/Twitter）的绝对 URL 基准，避免解析成 localhost
  metadataBase: new URL("https://www.fotobestway.com.cn"),
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = getMessages("en");

  return (
    <html lang="en">
      <body>
        {/* 品牌级结构化数据（全站）：Organization + WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Fotobestway",
              url: "https://www.fotobestway.com.cn",
              email: "info@fotobestway.com.cn",
              sameAs: [
                "https://www.facebook.com/profile.php?id=61561703761081",
                "https://www.youtube.com/@fotobestwayphotovideo",
                "https://www.instagram.com/fotobestway/",
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "Fotobestway",
              url: "https://www.fotobestway.com.cn",
            }),
          }}
        />
        <TranslationProvider messages={messages}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
