// src/transport/transport.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export const MAIL_TRANSPORT = 'MAIL_TRANSPORT';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: MAIL_TRANSPORT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const service = config.get<string>('MAIL_SERVICE') || 'gmail';
        if (service === 'gmail') {
          return nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: config.get<string>('MAIL_USER'),
              pass: config.get<string>('MAIL_PASS'),
            },
          });
        }
        // return nodemailer.createTransport({
        //   host: config.get<string>('MAIL_HOST'),
        //   port: parseInt(config.get<string>('MAIL_PORT') || '587', 10),
        //   secure: config.get<string>('MAIL_SECURE') === 'true',
        //   auth: {
        //     user: config.get<string>('MAIL_USER'),
        //     pass: config.get<string>('MAIL_PASS'),
        //   },
        // });
      },
    },
  ],
  exports: [MAIL_TRANSPORT],
})
export class TransportModule {}
