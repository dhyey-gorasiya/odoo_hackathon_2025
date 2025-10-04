import { Module } from '@nestjs/common';
import { OCRJobsController } from './ocr-jobs.controller';
import { OCRJobsService } from './ocr-jobs.service';

@Module({
  controllers: [OCRJobsController],
  providers: [OCRJobsService],
})
export class OCRJobsModule {}
