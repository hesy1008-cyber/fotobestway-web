import { prisma } from "@/app/lib/prisma";
import GalleryShowcaseClient from "./GalleryShowcaseClient";

export default async function GalleryShowcase() {
  const items = await prisma.galleryItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (items.length === 0) {
    return null;
  }

  // 随机排序
  const shuffled = [...items].sort(() => Math.random() - 0.5);

  // 分成两组，用于两排轮播
  const mid = Math.ceil(shuffled.length / 2);
  const row1Items = shuffled.slice(0, mid);
  const row2Items = shuffled.slice(mid);

  // 转换为 plain object，传给客户端组件
  const toPlain = (arr: typeof items) =>
    arr.map((item) => ({
      id: item.id,
      image: item.image,
      title: item.title,
      photographer: item.photographer,
    }));

  return (
    <GalleryShowcaseClient
      row1Items={toPlain(row1Items)}
      row2Items={toPlain(row2Items)}
    />
  );
}
