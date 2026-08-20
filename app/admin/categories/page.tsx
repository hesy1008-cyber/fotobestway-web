import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import DeleteCategoryButton from "./DeleteCategoryButton";

// 强制动态渲染，避免缓存
export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      products: true,
      subCategories: {
        include: {
          products: true,
        },
        orderBy: {
          sortOrder: "asc",
        },
      },
    },
    orderBy: {
      sortOrder: "asc",
    },
  });

  return (
    <div>
      {/* 页面标题 */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">分类管理</h1>
          <p className="admin-page-subtitle">
            管理产品分类与子分类（共 {categories.length} 个分类）
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="admin-btn admin-btn-primary"
        >
          + 新增分类
        </Link>
      </div>

      {/* 分类列表 */}
      <div className="admin-category-list">
        {categories.map((category, index) => (
          <div key={category.id} className="admin-category-card-new">
            {/* 顶部：分类名称 + 操作按钮 */}
            <div className="category-card-header">
              <div className="category-card-title-area">
                <span className="category-card-badge">{String(index + 1).padStart(2, "0")}</span>
                <h2 className="category-card-title">{category.name}</h2>
              </div>
              <div className="category-card-actions">
                <Link
                  href={`/admin/categories/${category.id}/sub-categories`}
                  className="category-action-btn"
                >
                  子分类
                </Link>
                <Link
                  href={`/admin/categories/${category.id}/edit`}
                  className="category-action-btn"
                >
                  编辑
                </Link>
                <DeleteCategoryButton id={category.id} />
              </div>
            </div>

            {/* 中间：左边图片 + 右边统计信息 */}
            <div className="category-card-body">
              <div className="category-card-image">
                {category.bannerImage ? (
                  <img src={category.bannerImage} alt={category.name} />
                ) : (
                  <div className="category-card-image-placeholder">
                    <span>无图片</span>
                  </div>
                )}
              </div>
              <div className="category-card-stats">
                <div className="category-stat-item">
                  <span className="category-stat-label">产品数量</span>
                  <span className="category-stat-value">{category.products.length}</span>
                </div>
                <div className="category-stat-item">
                  <span className="category-stat-label">子分类数</span>
                  <span className="category-stat-value">{category.subCategories.length}</span>
                </div>
                <div className="category-stat-item">
                  <span className="category-stat-label">分类标识</span>
                  <span className="category-stat-value category-stat-slug">{category.slug}</span>
                </div>
              </div>
            </div>

            {/* 底部：子分类列表 */}
            {category.subCategories.length > 0 && (
              <div className="category-card-sub-list">
                <div className="category-sub-list-title">子分类列表</div>
                <div className="category-sub-items">
                  {category.subCategories.map((sub) => (
                    <div key={sub.id} className="category-sub-item">
                      <Link
                        href={`/admin/categories/${category.id}/sub-categories/${sub.id}/edit`}
                        className="category-sub-item-name"
                      >
                        {sub.name}
                      </Link>
                      <span className="category-sub-item-count">{sub.products.length} 个产品</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
