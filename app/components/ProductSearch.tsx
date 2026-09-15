"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type SpecModel = { model?: string | null };
type SearchProduct = {
  title: string;
  slug: string;
  categoryRef: { name: string; slug: string } | null;
  specs?: unknown;
};

export default function ProductSearch({
  products,
}: {
  products: SearchProduct[];
}) {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];

    return products
      .filter((product) => {
        // 同时匹配 SKU（specifications 里的型号）
        const specsModels = Array.isArray(product.specs)
          ? (product.specs as SpecModel[])
              .map((s) => (s && typeof s.model === "string" ? s.model : ""))
              .filter(Boolean)
          : [];
        return [
          product.title,
          product.categoryRef?.name,
          product.categoryRef?.slug,
          ...specsModels,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalized));
      })
      .slice(0, 6);
  }, [products, query]);

  return (
    <div className="productSearch">
      <label htmlFor="product-search">Search products</label>
      <div className="productSearchInput">
        <span aria-hidden="true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21L16.65 16.65" strokeLinecap="round" />
          </svg>
        </span>
        <input
          id="product-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Please enter keywords"
        />
      </div>

      {query.trim() && (
        <div className="productSearchResults">
          {matches.length ? (
            matches.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                onClick={() => setQuery("")}
              >
                <span>{product.title}</span>
                <small>{product.categoryRef?.name}</small>
              </Link>
            ))
          ) : (
            <p>No matching products</p>
          )}
        </div>
      )}
    </div>
  );
}
