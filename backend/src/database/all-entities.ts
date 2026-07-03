import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Milestone } from '../projects/entities/milestone.entity';
import { Module as ProjectModule } from '../projects/entities/module.entity';
import { Feature } from '../projects/entities/feature.entity';
import { ProjectType } from '../entities/project-type.entity';
import { Product } from '../products/entities/product.entity';
import { Payment } from '../payments/entities/payment.entity';
import { ChatSession } from '../chatbot/entities/chat-session.entity';
import {
  ProjectRequest,
  RequestDocument,
  RequestMessage,
  MessageAttachment,
} from '../requests/entities/request.entity';
import { AnalyticsEvent, PageView } from '../analytics/analytics.entity';
import { HostingExpense } from '../hosting-expenses/entities/hosting-expense.entity';
import { LedgerAccount } from '../ledger/entities/ledger-account.entity';
import { LedgerEntry } from '../ledger/entities/ledger-entry.entity';
import { Invoice, InvoiceItem } from '../invoices/entities/invoice.entity';

/** Single registry so Vercel/serverless always loads every entity class. */
export const ALL_ENTITIES = [
  User,
  Project,
  Milestone,
  ProjectModule,
  Feature,
  ProjectType,
  Product,
  Payment,
  ChatSession,
  ProjectRequest,
  RequestDocument,
  RequestMessage,
  MessageAttachment,
  PageView,
  AnalyticsEvent,
  HostingExpense,
  LedgerAccount,
  LedgerEntry,
  Invoice,
  InvoiceItem,
];

export function assertEntitiesLoaded(): void {
  const missing = ALL_ENTITIES.filter((entity) => !entity).map((_, i) => i);
  if (missing.length > 0) {
    throw new Error(`Entity classes failed to load at indices: ${missing.join(', ')}`);
  }
}
