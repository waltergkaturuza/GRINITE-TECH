import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { corsOptions, resolveAllowOrigin } from '../src/config/cors.config';

// Cache the NestJS app instance for reuse across invocations (serverless optimization)
let cachedApp: any = null;

export default async function handler(req: any, res: any) {
  try {
    // Get origin for CORS
    const origin = req.headers.origin as string | undefined;
    const allowOrigin = resolveAllowOrigin(origin);
    
    // Set CORS headers immediately (before any async operations)
    if (allowOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
    
    // Handle OPTIONS preflight immediately
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Initialize NestJS app if not cached (cold start)
    if (!cachedApp) {
      console.log('[NestJS] Cold start - initializing app...');
      
      const expressApp = express();
      const adapter = new ExpressAdapter(expressApp);
      
      cachedApp = await NestFactory.create(AppModule, adapter, {
        logger: ['error', 'warn'],
        abortOnError: false,
      });
      
      // Enable CORS
      cachedApp.enableCors(corsOptions);
      
      // Global validation
      cachedApp.useGlobalPipes(
        new ValidationPipe({
          whitelist: true,
          transform: true,
          forbidNonWhitelisted: false,
        })
      );
      
      // API prefix
      cachedApp.setGlobalPrefix('api/v1');
      
      // Initialize
      await cachedApp.init();
      
      console.log('[NestJS] App initialized successfully');
    }
    
    // Handle request with NestJS
    return cachedApp.getHttpAdapter().getInstance()(req, res);
    
  } catch (error: any) {
    console.error('[Error] Function failed:', error);
    console.error('[Error] Stack:', error?.stack);
    
    // Ensure CORS headers are set even on error
    const origin = req.headers.origin as string | undefined;
    const allowOrigin = resolveAllowOrigin(origin);
    if (allowOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || String(error),
    });
  }
}
