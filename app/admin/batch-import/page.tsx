import { prisma } from "@/app/lib/prisma";
import BatchImportClient from "./BatchImportClient";

export const dynamic = "force-dynamic";

export default async function BatchImportPage() {
  const categories = await prisma.category.findMany({
    include: { subCategories: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div>
      <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px", color: "#1a1a1a" }}>
        批量导入产品
      </h1>
      <BatchImportClient categories={categories} />
    </div>
  );
}
