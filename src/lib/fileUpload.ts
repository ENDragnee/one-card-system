// lib/fileUpload.ts
import path from "path";
import { writeFile, mkdir, stat, unlink } from "fs/promises";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR_RELATIVE = "/uploads/user-photos"; // Relative path for client URL
const UPLOAD_DIR_ABSOLUTE = path.join(process.cwd(), "public", UPLOAD_DIR_RELATIVE);

export async function handleFileUpload(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPG, PNG, GIF, WEBP are allowed.");
  }
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB.`);
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Sanitize filename
  const originalNameWithoutExt = path.parse(file.name).name;
  const safeOriginalName = originalNameWithoutExt.replace(/[^a-zA-Z0-9_.-]/g, '_');
  const fileExtension = path.extname(file.name);
  const filename = `${safeOriginalName}-${uuidv4()}${fileExtension}`;
  
  await mkdir(UPLOAD_DIR_ABSOLUTE, { recursive: true });
  const newFilePath = path.join(UPLOAD_DIR_ABSOLUTE, filename);
  await writeFile(newFilePath, buffer);
  
  return `${UPLOAD_DIR_RELATIVE}/${filename}`; // Store and return relative path
}

export async function deleteFile(filePath: string | null | undefined): Promise<void> {
  if (!filePath) return;
  // filePath is stored as relative (e.g., /uploads/user-photos/image.png)
  const fullPath = path.join(process.cwd(), "public", filePath);
  try {
    await stat(fullPath); // Check if file exists
    await unlink(fullPath);
    console.log(`Deleted file: ${fullPath}`);
  } catch (error: any) {
    if (error.code !== 'ENOENT') { // Ignore if file doesn't exist (ENOENT)
      console.warn(`Could not delete file: ${fullPath}`, error);
    }
  }
}