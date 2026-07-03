import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { RootController } from './root.controller';

@Module({
  imports: [TypeOrmModule.forFeature([])],
  controllers: [HealthController, RootController],
})
export class HealthModule {}