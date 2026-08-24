import { prisma } from "../app/lib/prisma";

async function main() {
  const cats = await prisma.category.findMany({
    include: { subCategories: true },
    orderBy: { sortOrder: "asc" },
  });

  console.log("现有分类:");
  for (const c of cats) {
    console.log(`  - ${c.name} (slug: ${c.slug})`);
    for (const s of c.subCategories) {
      console.log(`      - ${s.name} (slug: ${s.slug})`);
    }
  }

  const productCount = await prisma.product.count();
  console.log(`\n当前产品总数: ${productCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
