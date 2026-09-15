"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CONTACT_EMAIL = "maggie@fotobestway.com.cn";
const WHATSAPP_URL = "https://wa.me/8613567826336";

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
        whatsapp: "WhatsApp 咨询",
        whatsappDesc: "最快响应，工作日即时回复",
        email: "发邮件给我们",
        message: "在线留言",
        msgDesc: "填写询盘表单，24 小时内回复",
        close: "关闭",
      }
    : {
        title: "Contact Us",
        desc: "Need help? We're here for you",
        whatsapp: "WhatsApp Us",
        whatsappDesc: "Fastest reply, instant support",
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
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>
              <strong>{t.whatsapp}</strong>
              <small>{t.whatsappDesc}</small>
            </span>
          </a>
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
