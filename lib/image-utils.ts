/**
 * 클라이언트 이미지 처리: WebP 변환, 가로 최대 1200px 리사이즈
 * 서버에는 WebP만 업로드
 */

const MAX_WIDTH = 1200;
const WEBP_QUALITY = 0.85;

/** File을 WebP Blob으로 변환 (max 1200px) */
export async function processImageToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width > MAX_WIDTH) {
        height = Math.round((height * MAX_WIDTH) / width);
        width = MAX_WIDTH;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('WebP conversion failed'));
        },
        'image/webp',
        WEBP_QUALITY
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Image load failed'));
    };

    img.src = url;
  });
}

/** 여러 이미지 처리 (최대 3장) */
export async function processImagesToWebP(
  files: FileList | File[],
  maxCount: number = 3
): Promise<Blob[]> {
  const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
  const toProcess = fileArray.slice(0, maxCount);
  const results: Blob[] = [];

  for (const file of toProcess) {
    const blob = await processImageToWebP(file);
    results.push(blob);
  }

  return results;
}
