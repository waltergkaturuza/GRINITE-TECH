import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ServicesModule } from '../services/services.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [ProductsModule, ServicesModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

