"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {

    const pathname = usePathname();

    return (

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

                <Link
                    href="/"
                    className={pathname === "/" ? "active" : ""}
                >
                    Home
                </Link>

                <Link
                    href="/products"
                    className={pathname.startsWith("/products") ? "active" : ""}
                >
                    Products
                </Link>

                <Link
                    href="/about"
                    className={pathname === "/about" ? "active" : ""}
                >
                    About
                </Link>

                <Link
                    href="/contact"
                    className={pathname === "/contact" ? "active" : ""}
                >
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

    );

}