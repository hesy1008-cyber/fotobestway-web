import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import { updateSubCategory } from "../../../../sub-category-actions";

export default async function EditSubCategoryPage({
  params,
}: {
  params: Promise<{
    id: string;
    subId: string;
  }>;
}) {
  const { id, subId } = await params;

  const subCategory = await prisma.subCategory.findUnique({
    where: {
      id: subId,
    },
  });

  if (!subCategory) {
    return <div>Sub-category not found</div>;
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Edit Sub-Category</h1>
          <p className="admin-page-subtitle">
            Edit {subCategory.name}
          </p>
        </div>
        <Link
          href={`/admin/categories/${id}/sub-categories`}
          className="admin-btn admin-btn-secondary"
        >
          ← Back
        </Link>
      </div>

      <form action={updateSubCategory.bind(null, subId)} className="admin-form">
        <input type="hidden" name="categoryId" value={id} />

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">Sub-Category Name *</label>
            <input
              name="name"
              defaultValue={subCategory.name}
              className="admin-form-input"
              required
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Slug (URL) *</label>
            <input
              name="slug"
              defaultValue={subCategory.slug}
              className="admin-form-input"
              required
            />
            <p className="admin-form-help">URL-friendly version of the name</p>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={subCategory.sortOrder}
            className="admin-form-input"
            style={{ maxWidth: "200px" }}
          />
          <p className="admin-form-help">Lower numbers appear first</p>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">
            💾 Save Changes
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
