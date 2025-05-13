import { promises as fs } from 'fs';
import path from 'path';

export async function imageFileToBase64(relativePath: string): Promise<string> {
  try {
    const imagePath = path.join(process.cwd(), 'public', relativePath);
    const fileBuffer = await fs.readFile(imagePath);
    return `data:image/png;base64,${fileBuffer.toString('base64')}`;
  } catch (error) {
    console.error('Error reading image file:', error);
    throw error;
  }
}
