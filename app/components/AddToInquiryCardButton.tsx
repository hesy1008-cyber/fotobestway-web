"use client";

import { useInquiryCart } from "@/app/contexts/InquiryCartContext";
import { useTranslations } from "@/app/i18n/TranslationContext";

interface AddToInquiryCardButtonProps {
  productId: string;
  productSlug: string;
  productTitle: string;
  productImage: string;
  locale?: string;
  isZh?: boolean;
}

export default function AddToInquiryCardButton({
  productId,
  productSlug,
  productTitle,
  productImage,
  isZh = false,
}: AddToInquiryCardButtonProps) {
  const { addItem } = useInquiryCart();
  const t = useTranslations();

  const handleClick = () => {
    addItem({
      id: productId,
      slug: productSlug,
      title: productTitle,
      image: productImage,
    });
  };

  return (
    <button
      type="button"
      className="productCardInquiryBtn"
      style={isZh ? { fontSize: "15px", letterSpacing: "0" } : undefined}
      onClick={handleClick}
    >
      <span>{t?.products?.addToInquiry || "ADD TO INQUIRY"}</span>
      <span aria-hidden="true">+</span>
    </button>
  );
}
