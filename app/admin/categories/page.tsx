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
          products: {
            select: {
              id: true,
              title: true,
            },
          },
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
      <div className="admin-list">
        {categories.map((category, index) => (
          <div key={category.id} className="admin-card admin-category-card">
            <div className="admin-category-left">
              <div className="admin-category-badge">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div className="admin-category-info">
                <h3>{category.name}</h3>
                <p>
                  分类名称：{category.slug} · {category.products.length} 个产品 ·{" "}
                  {category.subCategories.length} 个子分类
                </p>
              </div>
            </div>
            <div className="admin-card-actions">
              <Link
                href={`/admin/categories/${category.id}/sub-categories`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                子分类
              </Link>
              <Link
                href={`/admin/categories/${category.id}/edit`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                编辑
              </Link>
              <DeleteCategoryButton id={category.id} />
            </div>
          </div>

          {/* 层级概览：展开查看二级分类和产品 */}
          <details className="category-hierarchy-details">
            <summary className="category-hierarchy-summary">
              查看层级概览（{category.subCategories.length} 个二级分类）
            </summary>
            <div className="category-hierarchy-content">
              {category.subCategories.length === 0 ? (
                <p className="category-hierarchy-empty">暂无二级分类</p>
              ) : (
                category.subCategories.map((sub) => (
                  <div key={sub.id} className="category-hierarchy-sub">
                    <div className="category-hierarchy-sub-title">
                      <span className="category-hierarchy-sub-name">{sub.name}</span>
                      <span className="category-hierarchy-sub-count">
                        {sub.products.length} 个产品
                      </span>
                    </div>
                    {sub.products.length > 0 && (
                      <ul className="category-hierarchy-products">
                        {sub.products.map((product) => (
                          <li key={product.id} className="category-hierarchy-product">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="category-hierarchy-product-link"
                            >
                              {product.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))
              )}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
