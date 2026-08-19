"use client";

import { useState } from "react";
import { createInquiry } from "@/app/actions/inquiry";
import { useTranslations } from "@/app/i18n/TranslationContext";

interface ContactFormProps {
  initialSubject?: string;
  initialProduct?: string;
  initialMessage?: string;
  locale?: string;
}

export default function ContactForm({ initialSubject = "", initialProduct = "", initialMessage = "" }: ContactFormProps) {
  const t = useTranslations();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    subject: initialSubject || "product-inquiry",
    message: initialMessage || (initialProduct ? `I'm interested in: ${initialProduct}\n\nPlease send me more information about this product.` : ""),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const result = await createInquiry(formData);
      if (result.success) {
        setSubmitStatus("success");
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          subject: "",
          message: "",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="contactForm" onSubmit={handleSubmit}>
      {submitStatus === "success" && (
        <div className="formSuccess">
          {t.contact.successMessage}
        </div>
      )}

      {submitStatus === "error" && (
        <div className="formError">
          {t.contact.errorMessage}
        </div>
      )}

      <div className="formRow">
        <div className="formGroup">
          <label htmlFor="name">{t.contact.nameLabel}</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder={t.contact.namePlaceholder}
          />
        </div>

        <div className="formGroup">
          <label htmlFor="email">{t.contact.emailLabel}</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder={t.contact.emailPlaceholder}
          />
        </div>
      </div>

      <div className="formRow">
        <div className="formGroup">
          <label htmlFor="company">{t.contact.companyLabel}</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder={t.contact.companyPlaceholder}
          />
        </div>

        <div className="formGroup">
          <label htmlFor="phone">{t.contact.phoneLabel}</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={t.contact.phonePlaceholder}
          />
        </div>
      </div>

      <div className="formGroup">
        <label htmlFor="subject">{t.contact.subjectLabel}</label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
        >
          <option value="">{t.contact.selectSubject}</option>
          <option value="product-inquiry">{t.contact.subjectProductInquiry}</option>
          <option value="oem-odm">{t.contact.subjectOemOdm}</option>
          <option value="wholesale">{t.contact.subjectWholesale}</option>
          <option value="support">{t.contact.subjectSupport}</option>
          <option value="other">{t.contact.subjectOther}</option>
        </select>
      </div>

      <div className="formGroup">
        <label htmlFor="message">{t.contact.messageLabel}</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder={t.contact.messagePlaceholder}
        />
      </div>

      <button type="submit" className="submitBtn" disabled={isSubmitting}>
        {isSubmitting ? t.contact.sending : t.contact.sendMessage}
      </button>

      <p className="formNote">
        {t.contact.formNote}
      </p>
    </form>
  );
}
