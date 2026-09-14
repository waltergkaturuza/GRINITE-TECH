import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsightPost } from './entities/insight-post.entity';
import { InsightComment } from './entities/insight-comment.entity';
import { InsightVote } from './entities/insight-vote.entity';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { InsightsSchemaBootstrap } from './insights-schema.bootstrap';

@Module({
  imports: [TypeOrmModule.forFeature([InsightPost, InsightComment, InsightVote])],
  controllers: [InsightsController],
  providers: [InsightsService, InsightsSchemaBootstrap],
  exports: [InsightsService],
})
export class InsightsModule {}
