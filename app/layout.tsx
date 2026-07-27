import type { Metadata } from "next";
import "./globals.css";
import "./styles/layout.css";
import "./styles/header.css";
import "./styles/home.css";
import "./styles/categories.css";
import "./styles/products.css";
import "./styles/detail.css";
import "./styles/footer.css";
import "./styles/admin.css";

import Header from "./components/Header";

export const metadata: Metadata = {
  title: "Fotobestway",
  description: "Professional Photography Equipment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body>

        <Header />

        {children}

      </body>
    </html>
  );
}