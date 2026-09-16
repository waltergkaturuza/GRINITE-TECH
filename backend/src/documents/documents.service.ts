import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { randomUUID } from 'crypto';
import {
  CompanyDocument,
  COMPANY_DOCUMENT_CATEGORIES,
  PROJECT_DOCUMENT_CATEGORIES,
} from './entities/company-document.entity';
import { CreateCompanyDocumentDto, UpdateCompanyDocumentDto } from './dto/document.dto';
import { Project } from '../projects/entities/project.entity';

type AuthUser = { userId?: string; id?: string; role?: string };

type MetaFile = {
  url?: string;
  pathname?: string;
  name?: string;
  originalName?: string;
  fileSize?: number;
  mimeType?: string;
};

const PROJECT_FORM_FILE_GROUPS = [
  {
    key: 'supportingDocuments',
    category: 'specs',
    description: 'Supporting document from the project form',
  },
  {
    key: 'fundingDocuments',
    category: 'other',
    description: 'Funding / budget document from the project form',
  },
] as const;

function isPrivileged(role?: string) {
  const r = (role || '').toLowerCase();
  return r === 'admin' || r === 'developer';
}

function authUserId(user?: AuthUser) {
  return user?.userId || user?.id || null;
}

function asFileList(value: unknown): MetaFile[] {
  if (!value) return [];
  let parsed: unknown = value;
  if (typeof parsed === 'string') {
    try {
      parsed = JSON.parse(parsed);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(
    (item): item is MetaFile =>
      Boolean(item && typeof item === 'object' && typeof (item as MetaFile).url === 'string'),
  );
}

function titleFromFileName(name: string) {
  return name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || name;
}

function isUniqueViolation(error: unknown) {
  const err = error as { code?: string; driverError?: { code?: string } };
  return err?.code === '23505' || err?.driverError?.code === '23505';
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(CompanyDocument)
    private readonly documents: Repository<CompanyDocument>,
    @InjectRepository(Project)
    private readonly projects: Repository<Project>,
  ) {}

  async create(dto: CreateCompanyDocumentDto, user?: AuthUser) {
    const privileged = isPrivileged(user?.role);
    const projectId = dto.projectId || undefined;

    if (!privileged) {
      if (!projectId) {
        throw new BadRequestException('Clients can only upload files to a project');
      }
      await this.assertProjectAccess(projectId, user);
    } else if (projectId) {
      await this.assertProjectAccess(projectId, user);
    }

    const scope: 'company' | 'project' = projectId ? 'project' : dto.scope || 'company';
    if (!privileged && scope !== 'project') {
      throw new ForbiddenException('Not allowed to manage company documents');
    }

    this.assertCategory(scope, dto.category);

    const doc = this.documents.create({
      id: randomUUID(),
      title: dto.title,
      description: dto.description || null,
      category: dto.category,
      scope,
      projectId: projectId || null,
      url: dto.url,
      pathname: dto.pathname,
      originalName: dto.originalName,
      fileSize: Number(dto.fileSize) || 0,
      mimeType: dto.mimeType || null,
      uploadedById: authUserId(user),
    });
    return this.documents.save(doc);
  }

  async findAll(
    filters: {
      category?: string;
      projectId?: string;
      scope?: string;
      search?: string;
    },
    user?: AuthUser,
  ) {
    await this.syncProjectFormDocuments(filters, user);

    const qb = this.documents
      .createQueryBuilder('doc')
      .leftJoinAndSelect('doc.project', 'project')
      .leftJoin('project.client', 'client')
      .leftJoinAndSelect('doc.uploadedBy', 'uploadedBy')
      .orderBy('doc.createdAt', 'DESC');

    await this.applyVisibility(qb, filters, user);

    if (filters.category && filters.category !== 'all') {
      qb.andWhere('doc.category = :category', { category: filters.category });
    }
    if (filters.search?.trim()) {
      qb.andWhere(
        '(LOWER(doc.title) LIKE :q OR LOWER(doc.originalName) LIKE :q OR LOWER(COALESCE(doc.description, \'\')) LIKE :q OR LOWER(COALESCE(project.title, \'\')) LIKE :q)',
        { q: `%${filters.search.trim().toLowerCase()}%` },
      );
    }

    return qb.getMany();
  }

  async categoryCounts(
    filters: { projectId?: string; scope?: string },
    user?: AuthUser,
  ) {
    await this.syncProjectFormDocuments(filters, user);

    const qb = this.documents
      .createQueryBuilder('doc')
      .leftJoin('doc.project', 'project')
      .leftJoin('project.client', 'client')
      .select('doc.scope', 'scope')
      .addSelect('doc.category', 'category')
      .addSelect('COUNT(doc.id)', 'count')
      .groupBy('doc.scope')
      .addGroupBy('doc.category');

    await this.applyVisibility(qb, filters, user);

    const rows = await qb.getRawMany();
    return rows.map((row) => ({
      scope: row.doc_scope || row.scope || null,
      category: row.category,
      count: parseInt(String(row.count), 10) || 0,
    }));
  }

  async findOne(id: string, user?: AuthUser) {
    const doc = await this.documents.findOne({
      where: { id },
      relations: ['project', 'project.client', 'uploadedBy'],
    });
    if (!doc) throw new NotFoundException('Document not found');
    await this.assertDocumentAccess(doc, user);
    return doc;
  }

  async update(id: string, dto: UpdateCompanyDocumentDto, user?: AuthUser) {
    const doc = await this.findOne(id, user);
    if (dto.category) this.assertCategory(doc.scope, dto.category);
    Object.assign(doc, dto);
    return this.documents.save(doc);
  }

  async remove(id: string, user?: AuthUser) {
    const doc = await this.findOne(id, user);
    await this.detachFromProjectMetadata(doc);
    await this.documents.remove(doc);
    return { ok: true, pathname: doc.pathname, url: doc.url };
  }

  async importProjectFormFiles(project: Project, user?: AuthUser) {
    if (!project?.id) return [];

    const files = this.collectProjectFormFiles(project);
    if (!files.length) return [];

    const existing = await this.documents.find({ where: { projectId: project.id } });
    const existingUrls = new Set(existing.map((doc) => doc.url));
    const created: CompanyDocument[] = [];

    for (const file of files) {
      if (!file.url || existingUrls.has(file.url)) continue;
      const originalName = file.originalName;
      const doc = this.documents.create({
        id: randomUUID(),
        title: titleFromFileName(originalName),
        description: file.description,
        category: file.category,
        scope: 'project',
        projectId: project.id,
        url: file.url,
        pathname: file.pathname,
        originalName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        uploadedById: authUserId(user),
      });
      try {
        created.push(await this.documents.save(doc));
        existingUrls.add(file.url);
      } catch (error) {
        if (!isUniqueViolation(error)) throw error;
      }
    }

    return created;
  }

  private collectProjectFormFiles(project: Project) {
    const metadata = (project.metadata || {}) as Record<string, unknown>;
    return PROJECT_FORM_FILE_GROUPS.flatMap((group) =>
      asFileList(metadata[group.key]).map((file) => ({
        url: String(file.url),
        pathname: file.pathname || String(file.url),
        originalName: file.name || file.originalName || String(file.url).split('/').pop() || 'document',
        fileSize: Number(file.fileSize) || 0,
        mimeType: file.mimeType || null,
        category: group.category,
        description: group.description,
      })),
    );
  }

  private async syncProjectFormDocuments(
    filters: { projectId?: string; scope?: string },
    user?: AuthUser,
  ) {
    if (filters.scope === 'company') return;

    const qb = this.projects
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .andWhere('project.metadata IS NOT NULL');

    if (filters.projectId) {
      await this.assertProjectAccess(filters.projectId, user);
      qb.andWhere('project.id = :projectId', { projectId: filters.projectId });
    } else if (!isPrivileged(user?.role)) {
      const clientId = authUserId(user);
      if (!clientId) return;
      qb.andWhere('client.id = :clientId', { clientId });
    }

    const projects = await qb.getMany();
    for (const project of projects) {
      await this.importProjectFormFiles(project, user);
    }
  }

  private async detachFromProjectMetadata(doc: CompanyDocument) {
    if (doc.scope !== 'project' || !doc.projectId || !doc.url) return;
    const project = await this.projects.findOne({ where: { id: doc.projectId } });
    if (!project?.metadata) return;

    const metadata = { ...project.metadata };
    let changed = false;
    for (const group of PROJECT_FORM_FILE_GROUPS) {
      const current = asFileList(metadata[group.key]);
      const next = current.filter((file) => file.url !== doc.url);
      if (next.length !== current.length) {
        metadata[group.key] = next;
        changed = true;
      }
    }
    if (!changed) return;
    project.metadata = metadata;
    await this.projects.save(project);
  }

  private assertCategory(scope: 'company' | 'project', category: string) {
    const allowed =
      scope === 'project' ? PROJECT_DOCUMENT_CATEGORIES : COMPANY_DOCUMENT_CATEGORIES;
    if (!(allowed as readonly string[]).includes(category)) {
      throw new BadRequestException(`Invalid category "${category}" for ${scope} documents`);
    }
  }

  private async applyVisibility(
    qb: SelectQueryBuilder<CompanyDocument>,
    filters: { projectId?: string; scope?: string },
    user?: AuthUser,
  ) {
    const privileged = isPrivileged(user?.role);

    if (filters.projectId) {
      await this.assertProjectAccess(filters.projectId, user);
      qb.andWhere('doc.projectId = :projectId', { projectId: filters.projectId });
    }

    if (filters.scope === 'company' || filters.scope === 'project') {
      if (!privileged && filters.scope === 'company') {
        throw new ForbiddenException('Not allowed to view company documents');
      }
      qb.andWhere('doc.scope = :scope', { scope: filters.scope });
    }

    if (!privileged) {
      const clientId = authUserId(user);
      if (!clientId) throw new ForbiddenException('Missing authenticated user');
      qb.andWhere('doc.scope = :clientScope', { clientScope: 'project' });
      qb.andWhere('client.id = :clientId', { clientId });
    }
  }

  private async assertDocumentAccess(doc: CompanyDocument, user?: AuthUser) {
    if (isPrivileged(user?.role)) return;
    if (doc.scope !== 'project' || !doc.projectId) {
      throw new ForbiddenException('Not allowed to access this document');
    }
    await this.assertProjectAccess(doc.projectId, user);
  }

  private async assertProjectAccess(projectId: string, user?: AuthUser) {
    if (isPrivileged(user?.role)) return;
    const project = await this.projects.findOne({
      where: { id: projectId },
      relations: ['client'],
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.client?.id !== authUserId(user)) {
      throw new ForbiddenException('Not allowed to access this project');
    }
  }
}
