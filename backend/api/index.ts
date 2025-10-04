import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

let app: any;

export default async (req: any, res: any) => {
  // Enhanced CORS headers for Vercel deployment
  const allowedOrigins = [
    'http://localhost:3000',
    'https://grinite-tech-frontend.vercel.app',
    'https://granite-tech-frontend.vercel.app',
    'https://grinite-tech.vercel.app',
    process.env.FRONTEND_URL,
    process.env.NEXT_PUBLIC_SITE_URL
  ].filter(Boolean);

  const origin = req.headers.origin;
  
  // More permissive CORS for Vercel deployment
  if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    // Allow all origins for now to debug the issue
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!app) {
      const server = express();
      app = await NestFactory.create(AppModule, new ExpressAdapter(server));

      // More permissive CORS configuration for NestJS
      app.enableCors({
        origin: true, // Allow all origins for now
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
        preflightContinue: false,
        optionsSuccessStatus: 204
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
  } catch (error) {
    console.error('Error in Vercel function:', error);
    
    // Set CORS headers even for error responses
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With, Origin');
    
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};