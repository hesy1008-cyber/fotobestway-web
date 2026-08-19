"use client";

import { useState } from "react";

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
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
    />
  );
}
