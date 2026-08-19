"use client";

import { useState } from "react";
import { createInquiry } from "@/app/actions/inquiry";

interface ContactFormProps {
  initialSubject?: string;
  initialProduct?: string;
  initialMessage?: string;
}

export default function ContactForm({ initialSubject = "", initialProduct = "", initialMessage = "" }: ContactFormProps) {
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
          ✓ Thank you! Your message has been sent. We'll get back to you soon.
        </div>
      )}

      {submitStatus === "error" && (
        <div className="formError">
          ✗ Something went wrong. Please try again or email us directly.
        </div>
      )}

      <div className="formRow">
        <div className="formGroup">
          <label htmlFor="name">Full Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="Your name"
          />
        </div>

        <div className="formGroup">
          <label htmlFor="email">Email Address *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="your@email.com"
          />
        </div>
      </div>

      <div className="formRow">
        <div className="formGroup">
          <label htmlFor="company">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Your company"
          />
        </div>

        <div className="formGroup">
          <label htmlFor="phone">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+86 574 6270 7558"
          />
        </div>
      </div>

      <div className="formGroup">
        <label htmlFor="subject">Subject *</label>
        <select
          id="subject"
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          required
        >
          <option value="">Select a subject</option>
          <option value="product-inquiry">Product Inquiry</option>
          <option value="oem-odm">OEM / ODM Service</option>
          <option value="wholesale">Wholesale / Distribution</option>
          <option value="support">Technical Support</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="formGroup">
        <label htmlFor="message">Message *</label>
        <textarea
          id="message"
          name="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          placeholder="Tell us about your project, product requirements, or any questions you have..."
        />
      </div>

      <button type="submit" className="submitBtn" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </button>

      <p className="formNote">
        * Required fields. We respect your privacy and will never share your information.
      </p>
    </form>
  );
}
