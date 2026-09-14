import { Module } from '@nestjs/common';
import { ProductsModule } from '../products/products.module';
import { ServicesModule } from '../services/services.module';
import { InsightsModule } from '../insights/insights.module';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';

@Module({
  imports: [ProductsModule, ServicesModule, InsightsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

