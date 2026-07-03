import { Controller, Get } from '@nestjs/common';

@Controller()
export class RootController {
  @Get()
  root() {
    return {
      status: 'ok',
      service: 'Quantis Technologies API',
      version: '1.0',
      health: '/api/v1/health',
      docs: '/api/docs',
    };
  }
}
