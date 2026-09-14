import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InsightPost } from './entities/insight-post.entity';
import { InsightComment } from './entities/insight-comment.entity';
import { InsightVote } from './entities/insight-vote.entity';
import { InsightSubscriber } from './entities/insight-subscriber.entity';
import { InsightsService } from './insights.service';
import { InsightsController } from './insights.controller';
import { InsightsSchemaBootstrap } from './insights-schema.bootstrap';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([InsightPost, InsightComment, InsightVote, InsightSubscriber]),
    EmailModule,
  ],
  controllers: [InsightsController],
  providers: [InsightsService, InsightsSchemaBootstrap],
  exports: [InsightsService],
})
export class InsightsModule {}
