import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import helmet from 'helmet';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

export default async (req: any, res: any) => {
  if (!global.__nest_app__) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));

    // Security middleware
    app.use(helmet());

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

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('GRANITE TECH API')
      .setDescription('Comprehensive business management platform API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);

    await app.init();
    global.__nest_app__ = app;
  }

  return server(req, res);
};