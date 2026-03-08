const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 0.8;

export interface CompressedImage {
  base64: string;
  blob: Blob;
  width: number;
  height: number;
}

/**
 * Check if a file needs server-side conversion (HEIC/HEIF)
 */
function needsServerConversion(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

/**
 * Convert image on the server using Sharp (handles HEIC, etc.)
 */
async function convertOnServer(file: File): Promise<CompressedImage> {
  console.log("Converting image on server...");

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/image/convert", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || "Server conversion failed");
  }

  const result = await response.json();

  // Convert base64 back to blob
  const byteCharacters = atob(result.base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: "image/jpeg" });

  console.log("Server conversion successful:", { width: result.width, height: result.height, size: result.size });

  return {
    base64: result.base64,
    blob,
    width: result.width,
    height: result.height,
  };
}

/**
 * Compresses an image file to a maximum dimension while maintaining aspect ratio.
 * Handles HEIC/HEIF conversion via server-side processing.
 * Converts to JPEG format for consistent output.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  // Use server-side conversion for HEIC/HEIF files
  if (needsServerConversion(file)) {
    return convertOnServer(file);
  }

  // Try the modern createImageBitmap approach first
  if (typeof createImageBitmap === "function") {
    try {
      return await compressWithBitmap(file);
    } catch (err) {
      console.warn("createImageBitmap failed, trying fallback:", err);
      // Fall through to legacy method
    }
  }

  // Fallback to FileReader + Image approach
  return compressWithFileReader(file);
}

/**
 * Modern compression using createImageBitmap
 */
async function compressWithBitmap(file: File | Blob): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file);

  let { width, height } = bitmap;

  // Calculate new dimensions while maintaining aspect ratio
  if (width > height) {
    if (width > MAX_DIMENSION) {
      height = Math.round((height * MAX_DIMENSION) / width);
      width = MAX_DIMENSION;
    }
  } else {
    if (height > MAX_DIMENSION) {
      width = Math.round((width * MAX_DIMENSION) / height);
      height = MAX_DIMENSION;
    }
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Failed to get canvas context");
  }

  // Draw image with white background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(bitmap, 0, 0, width, height);

  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }

        const base64Full = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
        const base64 = base64Full.split(",")[1];

        if (!base64) {
          reject(new Error("Failed to encode image as base64"));
          return;
        }

        resolve({
          base64,
          blob,
          width,
          height,
        });
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

/**
 * Legacy compression using FileReader + Image element
 */
function compressWithFileReader(file: File | Blob): Promise<CompressedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== "string") {
        reject(new Error("Failed to read file as data URL"));
        return;
      }

      const img = new Image();

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          let { width, height } = img;

          // Validate dimensions
          if (width === 0 || height === 0) {
            reject(new Error("Invalid image dimensions"));
            return;
          }

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > MAX_DIMENSION) {
              height = Math.round((height * MAX_DIMENSION) / width);
              width = MAX_DIMENSION;
            }
          } else {
            if (height > MAX_DIMENSION) {
              width = Math.round((width * MAX_DIMENSION) / height);
              height = MAX_DIMENSION;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
          }

          // Draw image with white background (for transparency)
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          // Convert to JPEG blob
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create blob"));
                return;
              }

              // Get base64 without the data URL prefix
              const base64Full = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
              const base64 = base64Full.split(",")[1];

              if (!base64) {
                reject(new Error("Failed to encode image as base64"));
                return;
              }

              resolve({
                base64,
                blob,
                width,
                height,
              });
            },
            "image/jpeg",
            JPEG_QUALITY
          );
        } catch (err) {
          reject(new Error(`Canvas processing failed: ${err instanceof Error ? err.message : "Unknown error"}`));
        }
      };

      img.onerror = () => {
        reject(new Error(`Failed to load image. File type: ${file.type}, size: ${file.size} bytes`));
      };

      img.src = result;
    };

    reader.onerror = () => {
      reject(new Error(`Failed to read file: ${reader.error?.message || "Unknown error"}`));
    };

    reader.readAsDataURL(file);
  });
}

export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}
