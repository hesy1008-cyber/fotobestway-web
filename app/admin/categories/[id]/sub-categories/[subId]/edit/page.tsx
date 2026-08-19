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
    return (
      <div>
        <div className="admin-page-header">
          <div>
            <h1 className="admin-page-title">子分类不存在</h1>
          </div>
          <Link
            href={`/admin/categories/${id}/sub-categories`}
            className="admin-btn admin-btn-secondary"
          >
            ← 返回子分类列表
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">编辑子分类</h1>
          <p className="admin-page-subtitle">
            修改 {subCategory.name}
          </p>
        </div>
        <Link
          href={`/admin/categories/${id}/sub-categories`}
          className="admin-btn admin-btn-secondary"
        >
          ← 返回子分类列表
        </Link>
      </div>

      <form action={updateSubCategory.bind(null, subId)} className="admin-form">
        <input type="hidden" name="categoryId" value={id} />

        <div className="admin-form-row">
          <div className="admin-form-group">
            <label className="admin-form-label">子分类名称 *</label>
            <input
              name="name"
              defaultValue={subCategory.name}
              className="admin-form-input"
              required
            />
            <p className="admin-form-help">分类别名（URL）创建时自动生成，修改名称不会改变 URL</p>
          </div>
        </div>

        <div className="admin-form-group">
          <label className="admin-form-label">排序</label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={subCategory.sortOrder}
            className="admin-form-input"
            style={{ maxWidth: "200px" }}
          />
          <p className="admin-form-help">数字越小越靠前</p>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-btn admin-btn-primary">
            保存修改
          </button>
          <Link
            href={`/admin/categories/${id}/sub-categories`}
            className="admin-btn admin-btn-secondary"
            style={{ textDecoration: "none" }}
          >
            取消
          </Link>
        </div>
      </form>
    </div>
  );
}
