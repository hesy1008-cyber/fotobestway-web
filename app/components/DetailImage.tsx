"use client";

import { useState } from "react";
import Image from "next/image";

interface DetailImageProps {
  src: string;
  alt: string;
}

export default function DetailImage({ src, alt }: DetailImageProps) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={0}
      height={0}
      sizes="100vw"
      style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
