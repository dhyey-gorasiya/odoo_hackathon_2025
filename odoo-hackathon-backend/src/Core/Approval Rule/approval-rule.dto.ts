import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsNumber, 
  IsArray, 
  IsEnum 
} from 'class-validator';

export enum ApprovalRuleType {
  PERCENTAGE = 'percentage',
  SPECIFIC_APPROVER = 'specific_approver',
  HYBRID = 'hybrid',
}

export class CreateApprovalRuleDto {
  @IsString()
  @IsNotEmpty({ message: 'CompanyId is required' })
  companyId: string;

  @IsString()
  @IsNotEmpty({ message: 'Rule name is required' })
  name: string;

  @IsEnum(ApprovalRuleType, { message: 'Invalid rule type' })
  type: ApprovalRuleType;

  @IsOptional()
  @IsNumber()
  percentageThreshold?: number;

  @IsOptional()
  @IsString()
  specificApproverId?: string;

  @IsOptional()
  @IsArray()
  appliesToCategories?: string[];

  @IsOptional()
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @IsNumber()
  maxAmount?: number | null;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
