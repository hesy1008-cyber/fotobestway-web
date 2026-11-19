/**
 * 按鼠标坐标计算「插入到哪个产品之前」，返回 null 表示插到末尾。
 *
 * 产品标签是横向 flex-wrap 排列，所以先按行判断、行内再按水平中线判断：
 * 落在标签间隙、容器留白上也能得到正确落点，而不是一律追加到末尾。
 */
export function findDropBeforeId(
  container: HTMLElement,
  clientX: number,
  clientY: number,
  draggedId: string
): string | null {
  const tags = Array.from(
    container.querySelectorAll<HTMLElement>("[data-product-id]")
  ).filter((el) => el.getAttribute("data-product-id") !== draggedId);

  for (const el of tags) {
    const rect = el.getBoundingClientRect();
    if (clientY > rect.bottom + 4) continue;
    if (clientY < rect.top - 4) {
      return el.getAttribute("data-product-id");
    }
    if (clientX < rect.left + rect.width / 2) {
      return el.getAttribute("data-product-id");
    }
  }
  return null;
}
