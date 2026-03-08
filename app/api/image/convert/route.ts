import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink, readFile } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";
import { randomUUID } from "crypto";

const execAsync = promisify(exec);

const MAX_DIMENSION = 1200;
const JPEG_QUALITY = 80;

/**
 * Check if sips (macOS) or ImageMagick is available for HEIC conversion
 */
async function convertHeicWithSips(inputBuffer: Buffer): Promise<Buffer> {
  const tempId = randomUUID();
  const inputPath = join(tmpdir(), `input-${tempId}.heic`);
  const outputPath = join(tmpdir(), `output-${tempId}.jpg`);

  try {
    // Write input file
    await writeFile(inputPath, inputBuffer);

    // Use sips (built-in macOS tool) to convert HEIC to JPEG
    await execAsync(`sips -s format jpeg -s formatOptions ${JPEG_QUALITY} "${inputPath}" --out "${outputPath}"`);

    // Read the output file
    const outputBuffer = await readFile(outputPath);

    return outputBuffer as Buffer;
  } finally {
    // Cleanup temp files
    try {
      await unlink(inputPath);
    } catch {}
    try {
      await unlink(outputPath);
    } catch {}
  }
}

/**
 * Try to convert with ImageMagick as fallback
 */
async function convertHeicWithImageMagick(inputBuffer: Buffer): Promise<Buffer> {
  const tempId = randomUUID();
  const inputPath = join(tmpdir(), `input-${tempId}.heic`);
  const outputPath = join(tmpdir(), `output-${tempId}.jpg`);

  try {
    await writeFile(inputPath, inputBuffer);
    await execAsync(`convert "${inputPath}" -quality ${JPEG_QUALITY} "${outputPath}"`);
    const outputBuffer = await readFile(outputPath);
    return outputBuffer as Buffer;
  } finally {
    try {
      await unlink(inputPath);
    } catch {}
    try {
      await unlink(outputPath);
    } catch {}
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    let buffer: Buffer = Buffer.from(arrayBuffer) as Buffer;

    const isHeic = file.type === "image/heic" ||
                   file.type === "image/heif" ||
                   file.name.toLowerCase().endsWith(".heic") ||
                   file.name.toLowerCase().endsWith(".heif");

    // If HEIC, try to convert first using system tools
    if (isHeic) {
      console.log("HEIC file detected, attempting conversion...");

      // Try sips first (macOS)
      try {
        buffer = await convertHeicWithSips(buffer);
        console.log("HEIC converted with sips");
      } catch (sipsError) {
        console.log("sips failed, trying ImageMagick...", sipsError);

        // Try ImageMagick
        try {
          buffer = await convertHeicWithImageMagick(buffer);
          console.log("HEIC converted with ImageMagick");
        } catch (imError) {
          console.error("ImageMagick also failed:", imError);
          return NextResponse.json(
            { error: "HEIC conversion not supported. Please convert to JPEG before uploading." },
            { status: 422 }
          );
        }
      }
    }

    // Process with sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Calculate new dimensions
    let width = metadata.width || 1200;
    let height = metadata.height || 1200;

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

    // Convert to JPEG with compression
    const processedBuffer = await image
      .resize(width, height, { fit: "inside" })
      .jpeg({ quality: JPEG_QUALITY })
      .toBuffer();

    // Convert to base64
    const base64 = processedBuffer.toString("base64");

    return NextResponse.json({
      base64,
      width,
      height,
      size: processedBuffer.length,
      mimeType: "image/jpeg",
    });
  } catch (error) {
    console.error("Image conversion error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to process image: ${errorMessage}` },
      { status: 500 }
    );
  }
}
