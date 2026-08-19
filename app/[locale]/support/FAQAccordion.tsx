"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export default function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="faqAccordion">
      {items.map((item, index) => (
        <div
          key={index}
          className={`faqItem ${openIndex === index ? "open" : ""}`}
        >
          <button
            className="faqQuestion"
            onClick={() => toggleItem(index)}
            aria-expanded={openIndex === index}
          >
            <span>{item.question}</span>
            <span className="faqIcon">{openIndex === index ? "−" : "+"}</span>
          </button>

          {openIndex === index && (
            <div className="faqAnswer">
              <p>{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
