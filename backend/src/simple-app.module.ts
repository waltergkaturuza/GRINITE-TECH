import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SimpleProductsController } from './products/simple-products.controller';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [SimpleProductsController],
  providers: [],
})
export class SimpleAppModule {}