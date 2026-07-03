import { NestFactory } from '@nestjs/core';
import { ValidationPipe, RequestMethod } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { Invoice, ALL_ENTITIES } from '../src/database/all-entities';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import helmet from 'helmet';
import express from 'express';
import { corsOptions } from '../src/config/cors.config';

let cachedServer: express.Express | null = null;

async function bootstrap(): Promise<express.Express> {
  if (cachedServer) return cachedServer;

  // Touch entity registry so Vercel bundle retains every @Entity class
  if (!ALL_ENTITIES.some((entity) => entity.name === 'Invoice')) {
    throw new Error('Invoice entity missing from ALL_ENTITIES registry');
  }

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    {
      bodyParser: true,
      logger: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : undefined,
    },
  );

  // Security middleware
  app.use(helmet());

  // CORS
  app.enableCors(corsOptions);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      skipMissingProperties: false,
    }),
  );

  // API prefix (keep / root as a welcome page)
  app.setGlobalPrefix('api/v1', {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  await app.init();

  const dataSource = app.get(DataSource);
  if (!dataSource.hasMetadata(Invoice)) {
    console.error('CRITICAL: Invoice entity metadata not registered after TypeORM init');
  }

  cachedServer = expressApp;

  return cachedServer;
}

export default async function handler(req: express.Request, res: express.Response) {
  const server = await bootstrap();
  return server(req, res);
}
