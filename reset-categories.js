const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// 新类目结构
const newCategories = [
  {
    name: 'Stand & Boom',
    slug: 'stand-boom',
    sortOrder: 1,
    subCategories: [
      { name: 'Light Stands', slug: 'light-stands' },
      { name: 'C Stands', slug: 'c-stands' },
      { name: 'Roller Base Stands', slug: 'roller-base-stands' },
      { name: 'Wind-Up Stand', slug: 'wind-up-stand' },
      { name: 'Backdrop Stands', slug: 'backdrop-stands' },
      { name: 'Booms', slug: 'booms' },
      { name: 'Wall Mount & Brackets', slug: 'wall-mount-brackets' },
      { name: 'Ceiling Track System', slug: 'ceiling-track-system' },
      { name: 'Wheel Set', slug: 'wheel-set' },
      { name: 'Sandbags & Weights', slug: 'sandbags-weights' },
    ],
  },
  {
    name: 'Mounts & Carts',
    slug: 'mounts-carts',
    sortOrder: 2,
    subCategories: [
      { name: 'Carts', slug: 'carts' },
      { name: 'Clamps', slug: 'clamps' },
      { name: 'Grip Head', slug: 'grip-head' },
      { name: 'Extension Arms', slug: 'extension-arms' },
      { name: 'Studs & Adapters', slug: 'studs-adapters' },
      { name: 'Safety Cable', slug: 'safety-cable' },
    ],
  },
  {
    name: 'Light Modifiers',
    slug: 'light-modifiers',
    sortOrder: 3,
    subCategories: [
      { name: 'Flags & Scrims', slug: 'flags-scrims' },
      { name: 'Softbox', slug: 'softbox' },
      { name: 'Softbox Mount', slug: 'softbox-mount' },
      { name: 'Umbrellas', slug: 'umbrellas' },
      { name: 'Beauty Dish & Reflector', slug: 'beauty-dish-reflector' },
      { name: 'Optical Snoot', slug: 'optical-snoot' },
      { name: 'Gobos & Gels', slug: 'gobos-gels' },
    ],
  },
  {
    name: 'Backdrops',
    slug: 'backdrops',
    sortOrder: 4,
    subCategories: [
      { name: 'Easy Up Backdrops', slug: 'easy-up-backdrops' },
      { name: 'Collapsible Backdrops', slug: 'collapsible-backdrops' },
      { name: 'Printed Backdrops', slug: 'printed-backdrops' },
      { name: 'Muslin Backdrops', slug: 'muslin-backdrops' },
      { name: 'Seamless Paper Backdrops', slug: 'seamless-paper-backdrops' },
      { name: 'PVC & Vinyl Backdrops', slug: 'pvc-vinyl-backdrops' },
      { name: 'Shooting Tables', slug: 'shooting-tables' },
      { name: 'Backdrop Accessories', slug: 'backdrop-accessories' },
    ],
  },
  {
    name: 'Photo & Video Light',
    slug: 'photo-video-light',
    sortOrder: 5,
    subCategories: [
      { name: 'LED COB Light', slug: 'led-cob-light' },
      { name: 'LED Panel Light', slug: 'led-panel-light' },
      { name: 'LED Strip Light', slug: 'led-strip-light' },
      { name: 'LED Ring Light', slug: 'led-ring-light' },
      { name: 'LED Smartphone Light', slug: 'led-smartphone-light' },
      { name: 'LED Light Tent', slug: 'led-light-tent' },
      { name: 'Bulbs', slug: 'bulbs' },
    ],
  },
  {
    name: 'Cases & Bags',
    slug: 'cases-bags',
    sortOrder: 6,
    subCategories: [],
  },
];

// 产品归类映射（按产品标题关键词匹配）
// 格式：{ 产品标题关键词: { categorySlug, subCategorySlug } }
// subCategorySlug 为 null 表示只放到一级类目下，不分配二级类目
const productMapping = [
  // PL-400B LED Light → Photo & Video Light → LED COB Light
  { match: 'PL-400B', category: 'photo-video-light', subCategory: 'led-cob-light' },
  // PL-600B LED Light → Photo & Video Light → LED COB Light
  { match: 'PL-600B', category: 'photo-video-light', subCategory: 'led-cob-light' },
  // Fresnel Light → Photo & Video Light → LED COB Light
  { match: 'Fresnel', category: 'photo-video-light', subCategory: 'led-cob-light' },
  // Bi-Color ML Series COB Light → Photo & Video Light → LED COB Light
  { match: 'COB Light', category: 'photo-video-light', subCategory: 'led-cob-light' },
  // Paper Background → Backdrops → Seamless Paper Backdrops
  { match: 'Paper Background', category: 'backdrops', subCategory: 'seamless-paper-backdrops' },
  // Octagon Softbox → Light Modifiers → Softbox
  { match: 'Octagon Softbox', category: 'light-modifiers', subCategory: 'softbox' },
  // Rectangle Softbox → Light Modifiers → Softbox
  { match: 'Rectangle Softbox', category: 'light-modifiers', subCategory: 'softbox' },
  // Heavy Duty Light Stand → Stand & Boom → Light Stands
  { match: 'Heavy Duty Light Stand', category: 'stand-boom', subCategory: 'light-stands' },
  // Air Cushion Stand → Stand & Boom → Light Stands
  { match: 'Air Cushion Stand', category: 'stand-boom', subCategory: 'light-stands' },
  // 一个小灯架 → Stand & Boom → Light Stands
  { match: '一个小灯架', category: 'stand-boom', subCategory: 'light-stands' },
  // Grip Clamp → Mounts & Carts → Clamps
  { match: 'Grip Clamp', category: 'mounts-carts', subCategory: 'clamps' },
  // Dual-Layer Folding Photography Utility Wagon → Mounts & Carts → Carts
  { match: 'Wagon', category: 'mounts-carts', subCategory: 'carts' },
  // Butterfly Frame Large → Backdrops → 只放一级类目（匹配不上具体二级类目）
  { match: 'Butterfly Frame', category: 'backdrops', subCategory: null },
];

async function main() {
  console.log('=== 开始重置类目 ===\n');

  // 1. 先把所有产品的 categoryId 和 subCategoryId 设为 null
  console.log('1. 清除所有产品的类目关联...');
  await p.product.updateMany({
    data: { categoryId: null, subCategoryId: null },
  });

  // 2. 删除所有旧的 SubCategory
  console.log('2. 删除旧的二级类目...');
  await p.subCategory.deleteMany({});

  // 3. 删除所有旧的 Category
  console.log('3. 删除旧的一级类目...');
  await p.category.deleteMany({});

  // 4. 创建新的一级类目和二级类目
  console.log('4. 创建新的类目结构...');
  const categoryMap = {}; // slug -> id
  const subCategoryMap = {}; // slug -> id

  for (const cat of newCategories) {
    const createdCat = await p.category.create({
      data: {
        name: cat.name,
        slug: cat.slug,
        sortOrder: cat.sortOrder,
        subCategories: {
          create: cat.subCategories.map((sub, idx) => ({
            name: sub.name,
            slug: sub.slug,
            sortOrder: idx + 1,
          })),
        },
      },
      include: { subCategories: true },
    });

    categoryMap[cat.slug] = createdCat.id;
    createdCat.subCategories.forEach((sub) => {
      subCategoryMap[sub.slug] = sub.id;
    });

    console.log(`   ✓ ${cat.name} (${cat.subCategories.length} 个二级类目)`);
  }

  // 5. 更新产品归类
  console.log('\n5. 更新产品归类...');
  const allProducts = await p.product.findMany({ select: { id: true, title: true } });

  let matchedCount = 0;
  let unmatchedCount = 0;

  for (const product of allProducts) {
    const mapping = productMapping.find((m) => product.title.includes(m.match));

    if (mapping) {
      const categoryId = categoryMap[mapping.category];
      const subCategoryId = mapping.subCategory ? subCategoryMap[mapping.subCategory] : null;

      await p.product.update({
        where: { id: product.id },
        data: { categoryId, subCategoryId },
      });

      matchedCount++;
      const subName = mapping.subCategory
        ? ` → ${mapping.subCategory}`
        : ' (仅一级类目，待手动归类)';
      console.log(`   ✓ ${product.title} → ${mapping.category}${subName}`);
    } else {
      unmatchedCount++;
      console.log(`   ⚠ ${product.title} → 未匹配，保持无类目`);
    }
  }

  console.log(`\n=== 完成 ===`);
  console.log(`新类目：6 个一级类目，38 个二级类目`);
  console.log(`产品归类：${matchedCount} 个已匹配，${unmatchedCount} 个未匹配`);
}

main()
  .catch((e) => {
    console.error('出错了:', e);
    process.exit(1);
  })
  .finally(() => p.$disconnect());
