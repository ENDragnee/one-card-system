import bwipjs from 'bwip-js';
import { promises as fsPromises } from 'fs';
import db from '@/lib/db';


// Helper function to generate a unique USEA ID
export async function generateUniqueUSEAId() {
    const [result] = await db.execute(
      'SELECT unique_id FROM participant WHERE unique_id LIKE "USEA%" ORDER BY unique_id DESC LIMIT 1'
    );
  
    let nextNumber = 1;
    if (result[0]) {
      const lastId = result[0].unique_id;
      const lastNumber = parseInt(lastId.replace('USAE', ''));
      nextNumber = lastNumber + 1;
    }
  
    return `USAE${nextNumber.toString().padStart(4, '0')}`;
}

export async function generateBarcodeImage(text){
    try {
      const barcodeBuffer = await bwipjs.toBuffer({
        bcid: 'code128',
        text,
        scale: 3,
        height: 10,
        includetext: true,
        textxalign: 'center',
      });
      return `data:image/png;base64,${barcodeBuffer.toString('base64')}`;
    } catch (error) {
      console.error('Error generating barcode:', error);
      throw error;
    }
  }

// Helper function to ensure a directory exists
export async function ensureDirectoryExists(dir) {
    try {
      await fsPromises.mkdir(dir, { recursive: true });
    } catch (err) {
      if (err.code !== 'EEXIST') throw err;
    }
  };