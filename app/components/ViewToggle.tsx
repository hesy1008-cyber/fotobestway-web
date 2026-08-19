"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ViewToggle() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view") || "list";

  const createViewUrl = (view: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    return `${pathname}?${params.toString()}`;
  };

  return (
    <div className="viewToggle">
      <span className="viewLabel">View:</span>
      <Link
        href={createViewUrl("list")}
        className={`viewBtn ${currentView === "list" ? "active" : ""}`}
        aria-label="List view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
          <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
          <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
          <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
          <line x1="3" y1="6" x2="3.01" y2="6" strokeLinecap="round" />
          <line x1="3" y1="12" x2="3.01" y2="12" strokeLinecap="round" />
          <line x1="3" y1="18" x2="3.01" y2="18" strokeLinecap="round" />
        </svg>
      </Link>
      <Link
        href={createViewUrl("grid")}
        className={`viewBtn ${currentView === "grid" ? "active" : ""}`}
        aria-label="Grid view"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" xmlns="http://www.w3.org/2000/svg">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
      </Link>
    </div>
  );
}
