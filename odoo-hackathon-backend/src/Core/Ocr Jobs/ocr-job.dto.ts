import { 
  IsString, 
  IsNotEmpty, 
  IsEnum, 
  IsOptional, 
  IsNumber, 
  IsDateString, 
  IsObject, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export enum OCRJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  DONE = 'done',
  FAILED = 'failed',
}

export class OCRParsedLineDto {
  @IsOptional()
  description?: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  tax?: number;
}

export class OCRParsedDto {
  @IsNumber()
  amount: number;

  @IsDateString()
  date: string;

  @IsString()
  merchant: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => OCRParsedLineDto)
  lines?: OCRParsedLineDto[];
}

export class OCRJobDto {
  @IsString()
  @IsNotEmpty({ message: 'FileId is required' })
  fileId: string;

  @IsEnum(OCRJobStatus, { message: 'Invalid status' })
  status: OCRJobStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => OCRParsedDto)
  parsed?: OCRParsedDto;

  @IsOptional()
  errors?: string | null;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  completedAt?: Date | null;
}
