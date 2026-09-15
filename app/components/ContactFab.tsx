"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CONTACT_EMAIL = "maggie@fotobestway.com.cn";

export default function ContactFab({ locale = "en" }: { locale?: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [open]);

  const isZh = locale === "zh";
  const t = isZh
    ? {
        title: "联系我们",
        desc: "有疑问？我们随时为您服务",
        email: "发邮件给我们",
        message: "在线留言",
        msgDesc: "填写询盘表单，24 小时内回复",
        close: "关闭",
      }
    : {
        title: "Contact Us",
        desc: "Need help? We're here for you",
        email: "Email Us",
        message: "Leave a Message",
        msgDesc: "Fill the inquiry form, reply within 24h",
        close: "Close",
      };

  return (
    <div className="contact-fab-wrap" ref={wrapRef}>
      {open && (
        <div className="contact-fab-card" role="dialog" aria-label={t.title}>
          <div className="contact-fab-head">
            <strong>{t.title}</strong>
            <span>{t.desc}</span>
          </div>
          <a
            className="contact-fab-item"
            href={`mailto:${CONTACT_EMAIL}`}
            onClick={() => setOpen(false)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 6L2 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>
              <strong>{t.email}</strong>
              <small>{CONTACT_EMAIL}</small>
            </span>
          </a>
          <Link
            className="contact-fab-item"
            href={`/${locale}/contact`}
            onClick={() => setOpen(false)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>
              <strong>{t.message}</strong>
              <small>{t.msgDesc}</small>
            </span>
          </Link>
        </div>
      )}
      <button
        className="contact-float-btn"
        onClick={() => setOpen(!open)}
        aria-label={t.title}
        aria-expanded={open}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
