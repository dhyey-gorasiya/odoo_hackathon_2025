import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';

export class UserAuthDto {
  @IsNotEmpty({ message: 'Phone number is required' })
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'Phone number must be 10 digits' })
  userphone: string;

  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @Length(6, 20, { message: 'Password must be between 6 and 20 characters' })
  password: string;

  @IsOptional()
  verified : boolean;
}
