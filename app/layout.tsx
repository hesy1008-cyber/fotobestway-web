import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import "./styles/layout.css";
import "./styles/header.css";
import "./styles/home.css";
import "./styles/categories.css";
import "./styles/products.css";
import "./styles/detail.css";
import "./styles/footer.css";
import "./styles/admin.css";

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


        <header className="header">


          <Link href="/" className="logo">

            <Image
              src="/Logo.png"
              alt="Fotobestway"
              width={170}
              height={65}
              priority
            />

          </Link>



          <nav className="nav">


            <Link href="/">
              Home
            </Link>


            <Link href="/products">
              Products
            </Link>


            <Link href="/about">
              About
            </Link>


            <Link href="/contact">
              Contact
            </Link>


          </nav>



          <div className="headerRight">


            <span className="searchIcon">
              ⌕
            </span>


            <span>
              EN
            </span>


          </div>


        </header>



        {children}


      </body>

    </html>
  );
}