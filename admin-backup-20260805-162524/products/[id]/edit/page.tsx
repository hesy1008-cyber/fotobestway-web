import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import EditProductForm from "./EditProductForm";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: {
      id: id,
    },
    include: {
      categoryRef: true,
      subCategoryRef: true,
    },
  });

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

  if (!product) {
    return notFound();
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit Product</h1>
          <p className="admin-page-subtitle">
            Update product information and media
          </p>
        </div>
        <Link href="/admin/products" className="admin-btn admin-btn-secondary">
          ← Back to Products
        </Link>
      </div>

      <EditProductForm
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
        product={{
          id: product.id,
          title: product.title,
          slug: product.slug,
          shortDescription: product.shortDescription,
          image: product.image,
          categoryId: product.categoryId,
          categoryRef: product.categoryRef
            ? {
                id: product.categoryRef.id,
                name: product.categoryRef.name,
                slug: product.categoryRef.slug,
              }
            : null,
          subCategoryId: product.subCategoryId,
          subCategoryRef: product.subCategoryRef
            ? {
                id: product.subCategoryRef.id,
                name: product.subCategoryRef.name,
                slug: product.subCategoryRef.slug,
              }
            : null,
          gallery: product.gallery,
          detailImages: product.detailImages,
          overview: product.overview,
          features: Array.isArray(product.features)
            ? product.features.filter(
                (item): item is string => typeof item === "string"
              )
            : [],
          applications: Array.isArray(product.applications)
            ? product.applications.filter(
                (item): item is string => typeof item === "string"
              )
            : [],
          specs:
            typeof product.specs === "object" &&
            product.specs !== null &&
            !Array.isArray(product.specs)
              ? (product.specs as Record<string, string>)
              : {},
          video: product.video,
        }}
      />
    </div>
  );
}
