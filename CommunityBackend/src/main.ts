import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = Number(process.env.PORT ?? 3000);
  const host = '0.0.0.0';
  const logger = new Logger('Bootstrap');

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist           : true,   // removes unknown fields
      forbidNonWhitelisted: true,   // throw error for extra fields
      transform           : true,   // auto-transform types
    }),
  );

  await app.listen(port, host);
  logger.log(`HTTP server listening on http://${host}:${port}`);
}

bootstrap();
