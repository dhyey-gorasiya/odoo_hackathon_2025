import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber 
} from 'class-validator';

export class FileDto {
  @IsString()
  @IsNotEmpty({ message: 'CompanyId is required' })
  companyId: string;

  @IsString()
  @IsNotEmpty({ message: 'UploadedBy (userId) is required' })
  uploadedBy: string;

  @IsString()
  @IsNotEmpty({ message: 'Storage path is required' })
  storagePath: string;

  @IsString()
  @IsNotEmpty({ message: 'Original filename is required' })
  originalName: string;

  @IsNumber()
  @IsNotEmpty({ message: 'File size is required' })
  size: number;

  @IsString()
  @IsNotEmpty({ message: 'Mime type is required' })
  mimeType: string;

  @IsOptional()
  @IsString()
  ocrJobId?: string | null;

  @IsOptional()
  createdAt?: Date;
}
