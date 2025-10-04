// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthController } from './user.controller';
import { JwtStrategy } from './jwt.strategy';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { MailModule } from '../Mail/mail.module';

@Module({
  imports: [MailModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, OtpService],
  exports: [AuthService],
})
export class AuthModule {}
