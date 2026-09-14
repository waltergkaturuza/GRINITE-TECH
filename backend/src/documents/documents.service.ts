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

type AuthUser = { userId?: string; role?: string };

function isPrivileged(role?: string) {
  const r = (role || '').toLowerCase();
  return r === 'admin' || r === 'developer';
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
      uploadedById: user?.userId || null,
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
        '(LOWER(doc.title) LIKE :q OR LOWER(doc.originalName) LIKE :q OR LOWER(COALESCE(doc.description, \'\')) LIKE :q)',
        { q: `%${filters.search.trim().toLowerCase()}%` },
      );
    }

    return qb.getMany();
  }

  async categoryCounts(
    filters: { projectId?: string; scope?: string },
    user?: AuthUser,
  ) {
    const qb = this.documents
      .createQueryBuilder('doc')
      .leftJoin('doc.project', 'project')
      .leftJoin('project.client', 'client')
      .select('doc.category', 'category')
      .addSelect('COUNT(doc.id)', 'count')
      .groupBy('doc.category');

    await this.applyVisibility(qb, filters, user);

    const rows = await qb.getRawMany();
    return rows.map((row) => ({
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
    await this.documents.remove(doc);
    return { ok: true, pathname: doc.pathname, url: doc.url };
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
      if (!user?.userId) throw new ForbiddenException('Missing authenticated user');
      qb.andWhere('doc.scope = :clientScope', { clientScope: 'project' });
      qb.andWhere('client.id = :clientId', { clientId: user.userId });
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
    if (project.client?.id !== user?.userId) {
      throw new ForbiddenException('Not allowed to access this project');
    }
  }
}
