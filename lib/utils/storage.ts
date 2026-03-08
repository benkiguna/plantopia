import { createBrowserClient } from "@/lib/supabase";

const BUCKET_NAME = "plant-photos";

export async function uploadPlantPhoto(
  blob: Blob,
  userId: string
): Promise<string> {
  const supabase = createBrowserClient();

  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 8);
  const filename = `${userId}/${timestamp}-${randomId}.jpg`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filename, blob, {
      contentType: "image/jpeg",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    console.error("Error uploading photo:", error);
    throw new Error("Failed to upload photo");
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET_NAME).getPublicUrl(data.path);

  return publicUrl;
}

export async function deletePhoto(photoUrl: string): Promise<void> {
  const supabase = createBrowserClient();

  // Extract path from URL
  const url = new URL(photoUrl);
  const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/plant-photos\/(.+)/);

  if (!pathMatch) {
    console.error("Could not extract path from URL:", photoUrl);
    return;
  }

  const filePath = pathMatch[1];

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    console.error("Error deleting photo:", error);
  }
}
