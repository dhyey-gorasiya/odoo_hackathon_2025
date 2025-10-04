// src/mail/mail.module.ts
import { Module } from '@nestjs/common';
import { TransportModule, MAIL_TRANSPORT } from '../transport/transport.module';
import { MailService } from './mail.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule, TransportModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
