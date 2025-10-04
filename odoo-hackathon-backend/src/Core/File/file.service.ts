import { Injectable, Logger } from '@nestjs/common';
import { FileDto } from './file.dto';
import fb from '../../firebase/firebase';



@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private db = fb.getFirestore();

  async addFile(dto: FileDto) {
    try {
      const fileRef = this.db.collection('files').doc();
      const data = {
        ...dto,
        createdAt: new Date(),
      };
      await fileRef.set(data);

      return { success: true, id: fileRef.id, ...data };
    } catch (error) {
      this.logger.error(`Error saving file: ${error.message}`);
      throw error;
    }
  }

  async getFileById(id: string) {
    const doc = await this.db.collection('files').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getFilesByCompany(companyId: string) {
    const snapshot = await this.db
      .collection('files')
      .where('companyId', '==', companyId)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async deleteFile(id: string) {
    await this.db.collection('files').doc(id).delete();
    return { success: true, id };
  }
}
