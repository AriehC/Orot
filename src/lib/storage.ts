import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadMedia(
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const ext = file.name.split(".").pop() || "bin";
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
  const storageRef = ref(storage, `uploads/${userId}/${filename}`);

  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function deleteMedia(url: string): Promise<void> {
  try {
    const storageRef = ref(storage, url);
    await deleteObject(storageRef);
  } catch {
    // File may not exist, silently fail
  }
}
