"use client";

import { useState } from "react";

interface AccordionItem {
  title: string;
  content: React.ReactNode;
}

interface ProductAccordionProps {
  items: AccordionItem[];
  defaultOpenIndex?: number;
}

export default function ProductAccordion({ items, defaultOpenIndex = 0 }: ProductAccordionProps) {
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set([defaultOpenIndex]));

  const toggleItem = (index: number) => {
    setOpenIndexes((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <div className="product-accordion">
      {items.map((item, index) => (
        <div key={index} className={`accordion-item ${openIndexes.has(index) ? "open" : ""}`}>
          <button
            className="accordion-header"
            onClick={() => toggleItem(index)}
            aria-expanded={openIndexes.has(index)}
          >
            <span className="accordion-title">{item.title}</span>
            <span className="accordion-icon">{openIndexes.has(index) ? "−" : "+"}</span>
          </button>

          {openIndexes.has(index) && (
            <div className="accordion-content">
              {item.content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
