import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import { validateFileUpload } from "./sanitize";

export async function uploadMedia(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileType = file.type.startsWith("video/") ? "video" as const : "image" as const;
  const validationError = validateFileUpload(file, fileType);
  if (validationError) throw new Error(validationError);

  try {
    const ext = file.name.split(".").pop() || "bin";
    const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const storageRef = ref(storage, `uploads/${userId}/${filename}`);

    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  } catch (error) {
    console.error("uploadMedia failed:", error);
    throw error;
  }
}

export async function deleteMedia(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // File may not exist, silently fail
  }
}
