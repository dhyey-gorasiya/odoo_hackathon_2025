import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { FileService } from './file.service';
import { FileDto } from './file.dto';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  async uploadFile(@Body() dto: FileDto) {
    return this.fileService.addFile(dto);
  }

  @Get(':id')
  async getFileById(@Param('id') id: string) {
    return this.fileService.getFileById(id);
  }

  @Get()
  async getFilesByCompany(@Query('companyId') companyId: string) {
    return this.fileService.getFilesByCompany(companyId);
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    return this.fileService.deleteFile(id);
  }
}
