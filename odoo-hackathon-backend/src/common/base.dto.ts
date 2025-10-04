import { IsOptional, IsDateString, IsString } from 'class-validator';

export class BaseDto {
  @IsOptional()
  @IsDateString()
  created_at?: Date;

  @IsOptional()
  @IsString()
  created_by?: string;

  @IsOptional()
  @IsDateString()
  updated_at?: Date;

  @IsOptional()
  @IsString()
  updated_by?: string;
}
