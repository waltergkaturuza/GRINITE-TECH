import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CatalogService, CreateServiceDto, UpdateServiceDto } from './entities/service.entity'

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(CatalogService)
    private readonly serviceRepo: Repository<CatalogService>,
  ) {}

  private toList(value: unknown): string[] {
    if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean)
    if (typeof value === 'string' && value.trim()) {
      return value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean)
    }
    return []
  }

  private normalizePayload(dto: CreateServiceDto | UpdateServiceDto) {
    const payload: Record<string, unknown> = { ...dto }
    if ('features' in dto) payload.features = this.toList(dto.features)
    if ('keyBenefits' in dto) payload.keyBenefits = this.toList(dto.keyBenefits)
    if ('targetMarket' in dto) payload.targetMarket = this.toList(dto.targetMarket)
    if ('deliverables' in dto) payload.deliverables = this.toList(dto.deliverables)
    if ('price' in dto && dto.price != null) payload.price = Number(dto.price)
    if ('setupFee' in dto && dto.setupFee != null) payload.setupFee = Number(dto.setupFee)
    if ('monthlyFee' in dto && dto.monthlyFee != null) payload.monthlyFee = Number(dto.monthlyFee)
    if ('displayOrder' in dto && dto.displayOrder != null) payload.displayOrder = Number(dto.displayOrder)
    return payload
  }

  async findAll(category?: string, status?: string): Promise<CatalogService[]> {
    const query = this.serviceRepo.createQueryBuilder('service')

    if (category) {
      query.andWhere('LOWER(service.category) LIKE LOWER(:category)', {
        category: `%${category}%`,
      })
    }

    if (status) {
      query.andWhere('service.status = :status', { status })
    }

    return query.orderBy('service.displayOrder', 'ASC').addOrderBy('service.title', 'ASC').getMany()
  }

  async getCategories(): Promise<string[]> {
    const rows = await this.serviceRepo
      .createQueryBuilder('service')
      .select('DISTINCT service.category', 'category')
      .orderBy('service.category', 'ASC')
      .getRawMany<{ category: string }>()
    return rows.map((row) => row.category).filter(Boolean)
  }

  async findById(id: string): Promise<CatalogService | null> {
    return this.serviceRepo.findOne({ where: { id } })
  }

  async create(createServiceDto: CreateServiceDto): Promise<CatalogService> {
    const count = await this.serviceRepo.count()
    const service = this.serviceRepo.create({
      status: 'active',
      currency: 'USD',
      displayOrder: count + 1,
      features: [],
      ...this.normalizePayload(createServiceDto),
    } as CatalogService)
    return this.serviceRepo.save(service)
  }

  async update(id: string, updateServiceDto: Omit<UpdateServiceDto, 'id'>): Promise<CatalogService> {
    const service = await this.serviceRepo.findOne({ where: { id } })
    if (!service) {
      throw new NotFoundException('Service not found')
    }
    Object.assign(service, this.normalizePayload(updateServiceDto))
    return this.serviceRepo.save(service)
  }

  async delete(id: string): Promise<void> {
    const service = await this.serviceRepo.findOne({ where: { id } })
    if (!service) {
      throw new NotFoundException('Service not found')
    }
    await this.serviceRepo.remove(service)
  }

  async updateStatus(id: string, status: 'active' | 'inactive' | 'draft'): Promise<CatalogService> {
    return this.update(id, { status })
  }

  async updateDisplayOrder(id: string, displayOrder: number): Promise<CatalogService> {
    return this.update(id, { displayOrder })
  }
}
