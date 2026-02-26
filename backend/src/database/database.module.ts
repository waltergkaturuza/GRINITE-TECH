import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Milestone } from '../projects/entities/milestone.entity';
import { Module as ProjectModule } from '../projects/entities/module.entity';
import { Feature } from '../projects/entities/feature.entity';
import { ProjectType } from '../entities/project-type.entity';
import { Product } from '../products/entities/product.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ChatSession } from '../chatbot/entities/chat-session.entity';
import { ProjectRequest, RequestDocument, RequestMessage, MessageAttachment } from '../requests/entities/request.entity';
import { AnalyticsEvent, PageView } from '../analytics/analytics.entity';
import { HostingExpense } from '../hosting-expenses/entities/hosting-expense.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';
        
        if (isProduction) {
          // PostgreSQL configuration for production (Neon)
          return {
            type: 'postgres',
            url: configService.get('DATABASE_URL'),
            entities: [User, Project, Milestone, ProjectModule, Feature, ProjectType, Product, Payment, ChatSession, ProjectRequest, RequestDocument, RequestMessage, MessageAttachment, PageView, AnalyticsEvent, HostingExpense],
            synchronize: true, // Temporarily enabled to create schema
            ssl: {
              rejectUnauthorized: false
            },
            logging: false,
          };
        } else {
          // SQLite configuration for development
          return {
            type: 'better-sqlite3',
            database: ':memory:',
            entities: [User, Project, Milestone, ProjectModule, Feature, ProjectType, Product, Payment, ChatSession, ProjectRequest, RequestDocument, RequestMessage, MessageAttachment, PageView, AnalyticsEvent, HostingExpense],
            synchronize: true, // Only for development
            logging: true,
          };
        }
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}