import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { createSubCategory } from "../../../sub-category-actions";

export default async function NewSubCategoryPage({
  params,
}: {
  params: Promise<{
    id: string;
  }>;
}) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: {
      id: id,
    },
  });

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Add Sub-Category</h1>
          <p className="admin-page-subtitle">
            Add new sub-category to {category.name}
          </p>
        </div>
        <Link
          href={`/admin/categories/${id}/sub-categories`}
          className="admin-btn admin-btn-secondary"
        >
          ← Back
        </Link>
      </div>

      <form action={createSubCategory} className="admin-form">
        <input type="hidden" name="categoryId" value={id} />

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Sub-Category Name *</label>
            <input
              name="name"
              className="admin-form-input"
              required
              placeholder="e.g., LED Lights"
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Slug (URL) *</label>
            <input
              name="slug"
              className="admin-form-input"
              required
              placeholder="e.g., led-lights"
            />
            <p className="admin-form-help">URL-friendly version of the name</p>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={0}
            className="admin-form-input"
            style={{ maxWidth: "200px" }}
          />
          <p className="admin-form-help">Lower numbers appear first</p>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">
            ➕ Create Sub-Category
          </button>
          <Link
            href={`/admin/categories/${id}/sub-categories`}
            className="admin-btn admin-btn-secondary"
            style={{ textDecoration: "none" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
