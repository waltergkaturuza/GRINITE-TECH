/**
 * Single canonical entity registry for TypeORM.
 * Use static imports only — dynamic import() duplicates entity classes in Vercel
 * serverless bundles and causes "No metadata for Invoice was found".
 */
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Milestone } from '../projects/entities/milestone.entity';
import { Module as ProjectModuleEntity } from '../projects/entities/module.entity';
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
import { PageView, AnalyticsEvent } from '../analytics/analytics.entity';
import { HostingExpense } from '../hosting-expenses/entities/hosting-expense.entity';
import { LedgerAccount } from '../ledger/entities/ledger-account.entity';
import { LedgerEntry } from '../ledger/entities/ledger-entry.entity';
import { Invoice, InvoiceItem } from '../invoices/entities/invoice.entity';

export {
  User,
  Project,
  Milestone,
  ProjectModuleEntity,
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
};

export const ALL_ENTITIES: Function[] = [
  User,
  Project,
  Milestone,
  ProjectModuleEntity,
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

/** @deprecated Use ALL_ENTITIES — kept for api/index.ts compatibility */
export async function loadAllEntities(): Promise<Function[]> {
  if (!ALL_ENTITIES.some((entity) => entity.name === 'Invoice')) {
    throw new Error('Invoice entity failed to load — check entity imports');
  }
  return ALL_ENTITIES;
}
