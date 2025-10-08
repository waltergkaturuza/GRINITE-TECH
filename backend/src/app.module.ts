import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { MonitoringModule } from './monitoring/monitoring.module';
import { ChatbotModule } from './chatbot/chatbot.module';
import { ChatModule } from './chat/chat.module';
import { ServicesModule } from './services/services.module';
import { RequestsModule } from './requests/requests.module';
import { InvoicesModule } from './invoices/invoices.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { EmailModule } from './email/email.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Database
    DatabaseModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ProjectsModule,
    ProductsModule,
    PaymentsModule,
    MonitoringModule,
    ChatbotModule,
    ChatModule,
    ServicesModule,
    RequestsModule,
    InvoicesModule,
    HealthModule,
    EmailModule,
  ],
})
export class AppModule {}