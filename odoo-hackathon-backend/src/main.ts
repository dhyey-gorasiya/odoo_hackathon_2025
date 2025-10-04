import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import fb from './firebase/firebase';
import { json } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['log', 'error'] });
  app.enableCors({
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  });
  fb.setupFirebase();
  app.useGlobalPipes(new ValidationPipe ({
    whitelist: true, // strips properties that don't have any decorators
    forbidNonWhitelisted: true, // throw an error if non-decorated property found
    transform: true, // automatically transform payloads to DTO instances
  }));
  app.use(json())

  await app.listen(process.env.PORT , '0.0.0.0');
}
bootstrap();
