import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import MediaManager from "./MediaManager";

export default async function AdminMediaPage() {
  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: "asc" },
  });

  const galleryItems = await prisma.galleryItem.findMany({
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Media Management</h1>
          <p className="admin-page-subtitle">
            管理首页轮播图和佳作欣赏图片
          </p>
        </div>
        <Link href="/admin" className="admin-btn admin-btn-secondary">
          ← Back to Dashboard
        </Link>
      </div>

      <MediaManager
        initialBanners={banners.map((b) => ({
          id: b.id,
          image: b.image,
          title: b.title,
          subtitle: b.subtitle,
          buttonText: b.buttonText,
          buttonLink: b.buttonLink,
          sortOrder: b.sortOrder,
          isActive: b.isActive,
        }))}
        initialGallery={galleryItems.map((g) => ({
          id: g.id,
          image: g.image,
          title: g.title,
          photographer: g.photographer,
          sortOrder: g.sortOrder,
          isActive: g.isActive,
        }))}
      />
    </div>
  );
}
