import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { loadAllEntities } from '../src/database/all-entities';
import { AppModule } from '../src/app.module';
import { ensureInvoiceSchema } from '../src/invoices/invoice-schema.bootstrap';
import { DataSource } from 'typeorm';
import helmet from 'helmet';
import express from 'express';
import { corsOptions } from '../src/config/cors.config';

let cachedServer: express.Express | null = null;

async function bootstrap(): Promise<express.Express> {
  if (cachedServer) return cachedServer;

  // Ensure invoice entity class is loaded before Nest boot (Vercel serverless)
  await loadAllEntities();

  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    { bodyParser: true },
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

  // API prefix
  app.setGlobalPrefix('api/v1');

  await app.init();

  cachedServer = expressApp;

  // Don't block the first response — schema sync runs in the background
  if (process.env.NODE_ENV === 'production') {
    ensureInvoiceSchema(app.get(DataSource)).catch((error) => {
      console.error('Invoice schema bootstrap failed on startup', error);
    });
  }

  return cachedServer;
}

export default async function handler(req: express.Request, res: express.Response) {
  const server = await bootstrap();
  return server(req, res);
}
