import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export enum NotificationType {
  APPROVAL_REQUEST = 'approval_request',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class NotificationDto {
  @IsString()
  @IsNotEmpty({ message: 'CompanyId is required' })
  companyId: string;

  @IsString()
  @IsNotEmpty({ message: 'UserId is required' })
  userId: string;

  @IsEnum(NotificationType, { message: 'Invalid notification type' })
  type: NotificationType;

  @IsObject()
  @IsOptional()
  payload?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  read?: boolean = false;

  @IsOptional()
  createdAt?: Date;
}
