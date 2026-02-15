/**
 * @brief Creates a new HTMLImageElement from a source string (url or base64)
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    // only set crossOrigin if it's not an url, otherwise image is tainted
    if (!url.startsWith("data:"))
      image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  flip = { horizontal: false, vertical: false },
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  if (!pixelCrop || pixelCrop.width === 0 || pixelCrop.height === 0) {
    console.warn("Invalid crop area", pixelCrop);
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // transformation matrix for flipping
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // draw image at correct offset to capture crop area
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );
  ctx.restore();

  // toBlob is cringe, it uses callbacks
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/webp");
  });
}
