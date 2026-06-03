import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  // Serve the storefront UI (public/) at the root so stakeholders can click through it.
  app.useStaticAssets(join(__dirname, '..', 'public'));
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
  Logger.log(`checkout-service + storefront on http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
