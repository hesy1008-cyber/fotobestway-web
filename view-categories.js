const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const categories = await p.category.findMany({
    include: {
      subCategories: true,
      products: { select: { id: true, title: true } },
    },
    orderBy: { sortOrder: 'asc' },
  });

  categories.forEach((c, i) => {
    console.log(`\n=== ${i + 1}. ${c.name} (${c.slug}) - ${c.products.length} products ===`);
    c.subCategories.forEach((s, j) => {
      console.log(`  ${j + 1}. ${s.name} (${s.slug})`);
    });
    c.products.forEach((prod) => {
      console.log(`  [PRODUCT] ${prod.title}`);
    });
  });
}

main().finally(() => p.$disconnect());
