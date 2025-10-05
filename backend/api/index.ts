import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { corsOptions, resolveAllowOrigin, isOriginAllowed, logCorsDebug } from '../src/config/cors.config';

let app: any;

export default async (req: any, res: any) => {
  console.log('[Vercel Function] Request:', req.method, req.url, 'Origin:', req.headers.origin);
  
  // Enhanced CORS headers for Vercel deployment
  const origin = req.headers.origin as string | undefined;
  const allowOrigin = resolveAllowOrigin(origin);
  
  console.log('[CORS Debug] Origin:', origin, 'Allowed:', allowOrigin);
  
  if (allowOrigin) {
    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  }
  res.setHeader('Vary', 'Origin'); // Ensure caches differentiate
  res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
  res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  logCorsDebug(origin);
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (!app) {
      const server = express();
      app = await NestFactory.create(AppModule, new ExpressAdapter(server));

      // CORS configuration (shared)
      app.enableCors(corsOptions);

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
    if (isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin as string);
    }
    res.setHeader('Access-Control-Allow-Methods', corsOptions.methods.join(', '));
    res.setHeader('Access-Control-Allow-Headers', corsOptions.allowedHeaders.join(', '));
    
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};