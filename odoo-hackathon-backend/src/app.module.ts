import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './Core/User/user.module';
import { MailModule } from './Core/Mail/mail.module';
import { CompanyModule } from './Core/Company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule , MailModule , CompanyModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
