import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Product } from '../products/entities/product.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ChatSession } from '../chatbot/entities/chat-session.entity';

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
            entities: [User, Project, Product, Payment, ChatSession],
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
            entities: [User, Project, Product, Payment, ChatSession],
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