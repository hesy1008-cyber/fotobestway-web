"use client";

/**
 * 将图片文件生成为压缩缩略图（blob URL）。
 * 用于表单预览：避免直接把几十 MB 的原图交给浏览器解码导致页面卡顿。
 * 提交时仍使用原始 File 上传，画质不受影响。
 */
export function fileToThumbnail(file: File, maxSize = 300): Promise<string> {
  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(objectUrl);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(URL.createObjectURL(blob));
              } else {
                resolve(objectUrl);
              }
            },
            "image/jpeg",
            0.85
          );
        } else {
          resolve(objectUrl);
        }
      } catch (e) {
        resolve(objectUrl);
      }
    };
    img.onerror = () => resolve(objectUrl);
    img.src = objectUrl;
  });
}

/** 批量生成缩略图（串行处理，避免并发解码大图卡死主线程） */
export async function filesToThumbnails(files: File[], maxSize = 300): Promise<string[]> {
  const thumbs: string[] = [];
  for (const file of files) {
    thumbs.push(await fileToThumbnail(file, maxSize));
  }
  return thumbs;
}
