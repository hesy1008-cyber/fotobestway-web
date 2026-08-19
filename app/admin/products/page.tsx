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
          <h1 className="admin-page-title">产品列表</h1>
          <p className="admin-page-subtitle">
            管理产品目录（共 {products.length} 个产品）
          </p>
        </div>
        <Link href="/admin/products/new" className="admin-btn admin-btn-primary">
          + 新增产品
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
                <span>分类：{product.categoryRef?.name || "未分类"}</span>
                <span>产品名称：{product.slug}</span>
                <span>
                  图集：{" "}
                  {Array.isArray(product.gallery) ? product.gallery.length : 0} 张
                </span>
                <span>
                  详情图：{" "}
                  {Array.isArray(product.detailImages)
                    ? product.detailImages.length
                    : 0}{" "}
                  张
                </span>
              </div>
            </div>

            <div className="admin-card-actions">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
              >
                编辑
              </Link>
              <Link
                href={`/products/${product.slug}`}
                className="admin-btn admin-btn-secondary admin-btn-sm"
                target="_blank"
              >
                查看
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
