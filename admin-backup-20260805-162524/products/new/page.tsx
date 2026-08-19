import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import NewProductForm from "./NewProductForm";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  const subCategories = await prisma.subCategory.findMany({
    orderBy: {
      sortOrder: "asc",
    },
  });

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Add New Product</h1>
          <p className="admin-page-subtitle">
            Create a new product with images and details
          </p>
        </div>
        <Link href="/admin/products" className="admin-btn admin-btn-secondary">
          ← Back to Products
        </Link>
      </div>

      <NewProductForm
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }))}
        subCategories={subCategories.map((sc) => ({
          id: sc.id,
          name: sc.name,
          slug: sc.slug,
          categoryId: sc.categoryId,
        }))}
      />
    </div>
  );
}
