"use client";

import { useInquiryCart } from "@/app/contexts/InquiryCartContext";

interface AddToInquiryButtonProps {
  productId: string;
  productSlug: string;
  productTitle: string;
  productImage: string;
}

export default function AddToInquiryButton({
  productId,
  productSlug,
  productTitle,
  productImage,
}: AddToInquiryButtonProps) {
  const { addItem } = useInquiryCart();

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
      className="btn-secondary-outline"
      onClick={handleClick}
    >
      ADD TO INQUIRY →
    </button>
  );
}
