import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ALL_ENTITIES, assertEntitiesLoaded } from './all-entities';
import { Invoice, InvoiceItem } from '../invoices/entities/invoice.entity';

assertEntitiesLoaded();

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, InvoiceItem]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const isProduction = configService.get('NODE_ENV') === 'production';

        if (isProduction) {
          return {
            type: 'postgres',
            url: configService.get('DATABASE_URL'),
            entities: ALL_ENTITIES,
            autoLoadEntities: true,
            synchronize: false,
            ssl: {
              rejectUnauthorized: false,
            },
            extra: {
              connectionTimeoutMillis: 15000,
              query_timeout: 15000,
            },
            logging: false,
          };
        }

        return {
          type: 'better-sqlite3',
          database: ':memory:',
          entities: ALL_ENTITIES,
          autoLoadEntities: true,
          synchronize: true,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
