import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ServicesController } from './services.controller'
import { ServicesService } from './services.service'
import { CatalogService } from './entities/service.entity'
import { ServicesSchemaBootstrap } from './services-schema.bootstrap'

@Module({
  imports: [TypeOrmModule.forFeature([CatalogService])],
  controllers: [ServicesController],
  providers: [ServicesSchemaBootstrap, ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
