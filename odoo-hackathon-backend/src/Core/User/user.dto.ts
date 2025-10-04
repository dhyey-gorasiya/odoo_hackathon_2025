import { IsString, IsOptional, IsNotEmpty, IsEmail, Length, Matches } from 'class-validator';
import { UserAuthDto } from './user.auth.dto';

export class CreateUserDto extends UserAuthDto {
  @IsString()
  @IsNotEmpty()
  useremail: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  
  
  
}