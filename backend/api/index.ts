import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import express from 'express';
import { corsOptions } from '../src/config/cors.config';

let cachedServer: express.Express | null = null;

async function bootstrap(): Promise<express.Express> {
  if (cachedServer) return cachedServer;

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

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Quantis Technologies API')
    .setDescription('Comprehensive business management platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();
  cachedServer = expressApp;
  return cachedServer;
}

export default async function handler(req: express.Request, res: express.Response) {
  const server = await bootstrap();
  return server(req, res);
}
