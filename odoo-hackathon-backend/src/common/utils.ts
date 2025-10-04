// utils.ts
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import  fb  from '../firebase/firebase'; // Your Firebase initialization
import { FOLDER_NAME } from '../common/constraints';

export const uploadFileToFirebase = async (
  file: Express.Multer.File,
  folder: string
): Promise<string> => {
  try {
    console.log("Upload Image Name : "+ file.originalname);
    
    const bucket = fb.getStorageBucket();

    // Unique file name
    const fileName = `${FOLDER_NAME.ODOO_X_COMBAT}/${folder}/${uuidv4()}${path.extname(file.originalname)}`;

    // Upload
    const fileUpload = bucket.file(fileName);
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        firebaseStorageDownloadTokens: uuidv4(),
      },
    });

    // Make public
    await fileUpload.makePublic();

    // Public URL
    return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw new Error('Failed to upload file to Firebase Storage');
  }
};

export const JWT_SECRET = 'NDEZDZOfJn';

