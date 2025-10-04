import { 
  IsString, 
  IsNotEmpty, 
  IsOptional, 
  IsBoolean, 
  IsEnum, 
  IsEmail, 
  IsUrl 
} from 'class-validator';
import { UserAuthDto } from './user.auth.dto';

export enum UserRole {
  EMPLOYEE = 'employee',
  MANAGER = 'manager',
  FINANCE = 'finance',
  DIRECTOR = 'director',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export class CreateUserDto extends UserAuthDto{
  @IsOptional()
  companyId: string;

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsEnum(UserRole, { message: 'Invalid role' })
  role: UserRole;

  @IsBoolean()
  isManagerApprover: boolean;

  @IsOptional()
  @IsString()
  managerId?: string | null;

  @IsOptional()
  @IsUrl({}, { message: 'Invalid avatar URL' })
  avatarUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnum(UserStatus, { message: 'Invalid status' })
  status: UserStatus;

  @IsOptional()
  createdAt?: Date;

  @IsOptional()
  lastLoginAt?: Date;

  @IsOptional()
  metadata?: Record<string, any>;
}
