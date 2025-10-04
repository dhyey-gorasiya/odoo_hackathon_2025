import { 
  IsString, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsArray, 
  IsEnum, 
  IsDateString, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ExpenseStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ESCALATED = 'escalated',
}

export class ExpenseLineDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  amount: number;

  @IsNumber()
  tax: number;
}

export class ApprovalStepDto {
  @IsNumber()
  sequence: number;

  @IsOptional()
  @IsString()
  approverId?: string;

  @IsOptional()
  @IsString()
  role?: string;
}

export class ApprovalFlowDto {
  @IsString()
  type: 'sequential' | 'parallel';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovalStepDto)
  steps: ApprovalStepDto[];

  @IsOptional()
  @IsString()
  ruleId?: string | null;
}

export class CreateExpenseDto {
  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  createdBy: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsNumber()
  amountInCompanyCurrency: number;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  date: string;

  @IsEnum(ExpenseStatus)
  status: ExpenseStatus;

  @IsArray()
  @IsOptional()
  receiptFileIds?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseLineDto)
  expenseLines: ExpenseLineDto[];

  @ValidateNested()
  @Type(() => ApprovalFlowDto)
  approvalFlow: ApprovalFlowDto;

  @IsNumber()
  currentStep: number;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  updatedAt?: Date;

  @IsOptional()
  metadata?: Record<string, any>;
}
