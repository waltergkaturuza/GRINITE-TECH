import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('health')
export class HealthController {
  constructor(private configService: ConfigService) {}

  @Get()
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV'),
      hasDatabase: !!this.configService.get('DATABASE_URL'),
      hasJwtSecret: !!this.configService.get('JWT_SECRET'),
    };
  }

  @Get('env')
  getEnvCheck() {
    return {
      NODE_ENV: this.configService.get('NODE_ENV'),
      hasDatabase: !!this.configService.get('DATABASE_URL'),
      hasJwtSecret: !!this.configService.get('JWT_SECRET'),
      corsOrigin: this.configService.get('CORS_ORIGIN'),
      databaseUrlPrefix: this.configService.get('DATABASE_URL')?.substring(0, 20) + '...',
    };
  }
}