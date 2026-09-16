import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product } from './entities/product.entity';
import { ProductsSchemaBootstrap } from './products-schema.bootstrap';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsSchemaBootstrap, ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}