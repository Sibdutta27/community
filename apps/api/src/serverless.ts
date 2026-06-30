import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { Express } from 'express';
import { AppModule } from '@/app.module';

/**
 * Serverless entry for Vercel. Mirrors src/main.ts but uses app.init() instead of
 * app.listen(), and caches the underlying Express instance across warm invocations.
 *
 * The long-running entry (src/main.ts) is unchanged and is what runs on a private
 * server / Docker. Same AppModule, two entry points.
 */
let cached: Express | null = null;

async function bootstrap(): Promise<Express> {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: unknown, res: unknown) {
  if (!cached) {
    cached = await bootstrap();
  }
  return (cached as (req: unknown, res: unknown) => void)(req, res);
}
