import { Injectable, Logger } from '@nestjs/common';
import fb from '../../firebase/firebase';
import { OCRJobDto, OCRJobStatus } from './ocr-job.dto';


@Injectable()
export class OCRJobsService {
  private readonly logger = new Logger(OCRJobsService.name);
  private db = fb.getFirestore();

  async createJob(dto: OCRJobDto) {
    try {
      const jobRef = this.db.collection('ocrJobs').doc();
      const data = {
        ...dto,
        createdAt: new Date(),
        completedAt: null,
      };
      await jobRef.set(data);
      return { success: true, id: jobRef.id, ...data };
    } catch (error) {
      this.logger.error(`Error creating OCR job: ${error.message}`);
      throw error;
    }
  }

  async updateJobStatus(id: string, status: OCRJobStatus, parsed?: any, errors?: string) {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };
    if (status === OCRJobStatus.DONE) {
      updateData.completedAt = new Date();
      updateData.parsed = parsed;
    }
    if (status === OCRJobStatus.FAILED) {
      updateData.completedAt = new Date();
      updateData.errors = errors || 'Unknown error';
    }
    await this.db.collection('ocrJobs').doc(id).update(updateData);
    return { success: true, id, ...updateData };
  }

  async getJobById(id: string) {
    const doc = await this.db.collection('ocrJobs').doc(id).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getJobsByFile(fileId: string) {
    const snapshot = await this.db
      .collection('ocrJobs')
      .where('fileId', '==', fileId)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
