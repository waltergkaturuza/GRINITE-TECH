/** Load entity classes at runtime (avoids Vercel/serverless circular-import issues). */
export async function loadAllEntities(): Promise<Function[]> {
  const [
    { User },
    { Project },
    { Milestone },
    { Module: ProjectModuleEntity },
    { Feature },
    { ProjectType },
    { Product },
    { Payment },
    { ChatSession },
    { ProjectRequest, RequestDocument, RequestMessage, MessageAttachment },
    { PageView, AnalyticsEvent },
    { HostingExpense },
    { LedgerAccount },
    { LedgerEntry },
    { Invoice, InvoiceItem },
  ] = await Promise.all([
    import('../users/entities/user.entity'),
    import('../projects/entities/project.entity'),
    import('../projects/entities/milestone.entity'),
    import('../projects/entities/module.entity'),
    import('../projects/entities/feature.entity'),
    import('../entities/project-type.entity'),
    import('../products/entities/product.entity'),
    import('../payments/entities/payment.entity'),
    import('../chatbot/entities/chat-session.entity'),
    import('../requests/entities/request.entity'),
    import('../analytics/analytics.entity'),
    import('../hosting-expenses/entities/hosting-expense.entity'),
    import('../ledger/entities/ledger-account.entity'),
    import('../ledger/entities/ledger-entry.entity'),
    import('../invoices/entities/invoice.entity'),
  ]);

  const entities = [
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
  ].filter((entity) => typeof entity === 'function') as Function[];

  if (!entities.some((entity) => entity.name === 'Invoice')) {
    throw new Error('Invoice entity failed to load — check entity imports');
  }

  return entities;
}
