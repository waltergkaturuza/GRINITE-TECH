# Systematic Blob Storage

All documents in the system are stored in Vercel Blob using consistent path conventions.

## Path Structure

| Type | Path Pattern | Example |
|------|--------------|---------|
| **Projects** | `Projects/{project_name}/{subfolder?}/{date}/{filename}` | `Projects/acme-website/supporting/2025-02-24/proposal.pdf` |
| **Inquiries** | `Inquiries/{category}/{date}/{filename}` | `Inquiries/web-development/2025-02-24/brief.docx` |
| **Invoices** | `Invoices/{project_or_client}/{date}/{invoice_number}_{filename}` | `Invoices/acme-corp/2025-02-24/INV-001_contract.pdf` |
| **Quotations** | `Quotations/{project_or_client}/{date}/{quotation_number}_{filename}` | `Quotations/acme-corp/2025-02-24/QUO-001_scope.pdf` |

## Project Documents

- **Supporting documents**: `Projects/{project_name}/supporting/{date}/{filename}`
- **Funding documents**: `Projects/{project_name}/funding/{date}/{filename}`

## Inquiry Documents (Contact Form)

- Category = service selected (e.g. `web-development`, `mobile-development`, `general`)
- Path: `Inquiries/{category}/{date}/{filename}`

## Invoices & Quotations

Use when InvoiceForm/QuotationForm support attachments:

- **Invoice**: `Invoices/{projectOrClient}/{date}/{invoiceNumber}_{filename}`
- **Quotation**: `Quotations/{projectOrClient}/{date}/{quotationNumber}_{filename}`

## Implementation

- **Path builder**: `frontend/src/lib/blobStorage.ts` – `buildBlobPath()`
- **Upload API**: `frontend/src/app/api/upload/route.ts`
- **Component**: `frontend/src/components/BlobFileUpload.tsx`

## Environment

Set `BLOB_READ_WRITE_TOKEN` in `.env.local` (frontend) and Vercel project settings.
