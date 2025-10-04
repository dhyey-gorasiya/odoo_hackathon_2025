import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OCRJobsService } from './ocr-jobs.service';
import { OCRJobDto, OCRJobStatus } from './ocr-job.dto';

@Controller('ocr-jobs')
export class OCRJobsController {
  constructor(private readonly ocrJobsService: OCRJobsService) {}

  @Post()
  async createJob(@Body() dto: OCRJobDto) {
    return this.ocrJobsService.createJob(dto);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: OCRJobStatus,
    @Body('parsed') parsed?: any,
    @Body('errors') errors?: string,
  ) {
    return this.ocrJobsService.updateJobStatus(id, status, parsed, errors);
  }

  @Get(':id')
  async getJobById(@Param('id') id: string) {
    return this.ocrJobsService.getJobById(id);
  }

  @Get()
  async getJobsByFile(@Query('fileId') fileId: string) {
    return this.ocrJobsService.getJobsByFile(fileId);
  }
}
