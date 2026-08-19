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
        <TranslationProvider messages={messages}>
          {children}
        </TranslationProvider>
      </body>
    </html>
  );
}
