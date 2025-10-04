import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let app: any;

export default async (req: any, res: any) => {
  if (!app) {
    const server = express();
    app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // CORS configuration
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'https://granite-tech-frontend.vercel.app',
        process.env.FRONTEND_URL
      ].filter(Boolean),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global validation pipe
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // API prefix
    app.setGlobalPrefix('api/v1');

    await app.init();
  }

  return app.getHttpAdapter().getInstance()(req, res);
};