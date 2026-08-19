import Link from "next/link";
import Image from "next/image";
import DeleteButton from "@/app/components/DeleteButton";
import { prisma } from "@/app/lib/prisma";
import { deleteProduct } from "./actions";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      categoryRef: true,
    },
    orderBy: [{ title: "asc" }],
  });

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Products</h1>
          <p className="admin-page-subtitle">
            Manage your product catalog ({products.length} products total)
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          + Add Product
        </Link>
      </div>

      {/* 产品列表 */}
      <div className="admin-list">
        {products.map((product) => (
          <div key={product.id} className="admin-card">
            {product.image && (
              <div className="admin-card-image">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}

            <div className="admin-card-info">
              <h3 className="admin-card-title">{product.title}</h3>
              <div className="admin-card-meta">
                <span>Category: {product.categoryRef?.name || "No Category"}</span>
                <span>Slug: {product.slug}</span>
                <span>
                  Gallery:{" "}
                  {Array.isArray(product.gallery) ? product.gallery.length : 0} images
                </span>
                <span>
                  Details:{" "}
                  {Array.isArray(product.detailImages)
                    ? product.detailImages.length
                    : 0}{" "}
                  images
                </span>
              </div>
            </div>

            <div className="admin-card-actions">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                Edit
              </Link>
              <Link
                href={`/products/${product.slug}`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                target="_blank"
              >
                View
              </Link>
              <form action={deleteProduct}>
                <input type="hidden" name="id" value={product.id} />
                <DeleteButton />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
