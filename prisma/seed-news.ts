import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("开始添加占位新闻...");

  const newsItems = [
    {
      title: "Fotobestway Launches New PL-600B Professional LED Light",
      slug: "fotobestway-launches-pl-600b-led-light",
      summary:
        "Our latest 600W professional LED studio light delivers exceptional color accuracy and brightness for professional photographers and videographers.",
      content: `<p>Fotobestway is proud to announce the launch of our newest product, the PL-600B Professional LED Light. This 600W studio light is designed for professional photographers and videographers who demand the highest quality lighting.</p>
<h2>Key Features</h2>
<ul>
<li><strong>600W Power Output</strong> - Delivers exceptional brightness for large studio setups</li>
<li><strong>High CRI 96+</strong> - Ensures accurate color reproduction in every shot</li>
<li><strong>Bowens Mount</strong> - Compatible with a wide range of light modifiers</li>
<li><strong>Built-in Cooling System</strong> - Quiet operation with efficient heat dissipation</li>
<li><strong>DMX Control</strong> - Professional lighting control for studio setups</li>
</ul>
<h2>Availability</h2>
<p>The PL-600B is now available for purchase through our authorized distributors worldwide. Contact our sales team for pricing and bulk order inquiries.</p>`,
      coverImage: "/news/pl-600b.jpg",
      category: "Product Launch",
      sortOrder: 1,
      isActive: true,
    },
    {
      title: "Fotobestway to Exhibit at Photokina 2026 in Cologne",
      slug: "fotobestway-photokina-2026-cologne",
      summary:
        "Visit us at Photokina 2026 in Cologne, Germany, to experience our complete range of professional photography equipment firsthand.",
      content: `<p>Fotobestway is excited to announce our participation in Photokina 2026, the world's leading trade fair for the photographic and imaging industries, taking place in Cologne, Germany.</p>
<h2>What to Expect</h2>
<ul>
<li><strong>Complete Product Range</strong> - Experience our full lineup of LED lights, softboxes, light stands, and accessories</li>
<li><strong>Live Demonstrations</strong> - See our products in action with professional photographers</li>
<li><strong>New Product Preview</strong> - Be the first to see our upcoming releases</li>
<li><strong>Expert Consultations</strong> - Our team will be available to answer your questions</li>
</ul>
<h2>Booth Information</h2>
<p>Visit us at Hall 4.2, Booth D-012. We look forward to meeting you and discussing how Fotobestway equipment can enhance your photography workflow.</p>`,
      coverImage: "/news/photokina-2026.jpg",
      category: "Event",
      sortOrder: 2,
      isActive: true,
    },
    {
      title: "The Future of Studio Lighting: Trends to Watch in 2026",
      slug: "future-of-studio-lighting-trends-2026",
      summary:
        "Explore the emerging trends in studio lighting technology, from LED advancements to smart lighting control systems shaping the industry.",
      content: `<p>The studio lighting industry is undergoing rapid transformation, driven by technological advancements and changing creative demands. Here are the key trends shaping the future of studio lighting in 2026.</p>
<h2>1. LED Technology Continues to Evolve</h2>
<p>LED lighting has become the standard in professional studios, and the technology continues to improve. We're seeing higher color rendering indexes (CRI), wider color temperature ranges, and more efficient heat management systems.</p>
<h2>2. Smart Lighting Control</h2>
<p>App-controlled and DMX-compatible lighting systems are becoming increasingly popular. Photographers can now control multiple lights from a single device, saving time and enabling more creative lighting setups.</p>
<h2>3. Compact and Portable Solutions</h2>
<p>As content creation moves beyond the studio, portable lighting solutions are in high demand. Manufacturers are developing more compact, battery-powered lights that don't compromise on performance.</p>
<h2>4. RGB and Color Effects</h2>
<p>Creative color lighting is no longer just for video production. Photographers are increasingly using RGB lights to add mood and atmosphere to their images, opening up new creative possibilities.</p>
<h2>Conclusion</h2>
<p>The future of studio lighting is bright, with technology enabling more creative freedom and efficiency than ever before. At Fotobestway, we're committed to staying at the forefront of these trends and delivering innovative lighting solutions to our customers.</p>`,
      coverImage: "/news/studio-lighting-trends.jpg",
      category: "Industry Insights",
      sortOrder: 3,
      isActive: true,
    },
  ];

  for (const item of newsItems) {
    const existing = await prisma.news.findUnique({ where: { slug: item.slug } });
    if (existing) {
      console.log(`跳过已存在的新闻: ${item.title}`);
      continue;
    }
    await prisma.news.create({ data: item });
    console.log(`已添加新闻: ${item.title}`);
  }

  console.log("占位新闻添加完成！");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
