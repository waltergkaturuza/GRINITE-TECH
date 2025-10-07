import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ProjectType } from '../entities/project-type.entity'
import { CreateProjectTypeDto, UpdateProjectTypeDto } from '../dto/project-type.dto'

@Injectable()
export class ProjectTypesService {
  constructor(
    @InjectRepository(ProjectType)
    private projectTypesRepository: Repository<ProjectType>,
  ) {}

  async findAll(includeInactive = false): Promise<ProjectType[]> {
    const queryBuilder = this.projectTypesRepository.createQueryBuilder('projectType')
    
    if (!includeInactive) {
      queryBuilder.where('projectType.isActive = :isActive', { isActive: true })
    }
    
    return queryBuilder
      .orderBy('projectType.category', 'ASC')
      .addOrderBy('projectType.orderIndex', 'ASC')
      .addOrderBy('projectType.label', 'ASC')
      .getMany()
  }

  async findByCategory(category: string): Promise<ProjectType[]> {
    return this.projectTypesRepository.find({
      where: { category, isActive: true },
      order: { orderIndex: 'ASC', label: 'ASC' }
    })
  }

  async findCategories(): Promise<string[]> {
    const result = await this.projectTypesRepository
      .createQueryBuilder('projectType')
      .select('DISTINCT projectType.category', 'category')
      .where('projectType.isActive = :isActive', { isActive: true })
      .orderBy('projectType.category', 'ASC')
      .getRawMany()
    
    return result.map(item => item.category)
  }

  async findOne(id: string): Promise<ProjectType> {
    const projectType = await this.projectTypesRepository.findOne({ where: { id } })
    if (!projectType) {
      throw new NotFoundException(`Project type with ID ${id} not found`)
    }
    return projectType
  }

  async findByValue(value: string): Promise<ProjectType | null> {
    return this.projectTypesRepository.findOne({ where: { value } })
  }

  async create(createProjectTypeDto: CreateProjectTypeDto): Promise<ProjectType> {
    // Check if value already exists
    const existingType = await this.findByValue(createProjectTypeDto.value)
    if (existingType) {
      throw new ConflictException(`Project type with value '${createProjectTypeDto.value}' already exists`)
    }

    const projectType = this.projectTypesRepository.create(createProjectTypeDto)
    return this.projectTypesRepository.save(projectType)
  }

  async update(id: string, updateProjectTypeDto: UpdateProjectTypeDto): Promise<ProjectType> {
    const projectType = await this.findOne(id)
    
    // Check if updating value and it conflicts with existing
    if (updateProjectTypeDto.value && updateProjectTypeDto.value !== projectType.value) {
      const existingType = await this.findByValue(updateProjectTypeDto.value)
      if (existingType && existingType.id !== id) {
        throw new ConflictException(`Project type with value '${updateProjectTypeDto.value}' already exists`)
      }
    }

    Object.assign(projectType, updateProjectTypeDto)
    return this.projectTypesRepository.save(projectType)
  }

  async remove(id: string): Promise<void> {
    const projectType = await this.findOne(id)
    
    // Don't allow deletion of system types, only deactivation
    if (!projectType.isCustom) {
      throw new ConflictException('Cannot delete system project types. Use deactivation instead.')
    }
    
    await this.projectTypesRepository.remove(projectType)
  }

  async deactivate(id: string): Promise<ProjectType> {
    const projectType = await this.findOne(id)
    projectType.isActive = false
    return this.projectTypesRepository.save(projectType)
  }

  async reactivate(id: string): Promise<ProjectType> {
    const projectType = await this.findOne(id)
    projectType.isActive = true
    return this.projectTypesRepository.save(projectType)
  }

  async seedDefaultTypes(): Promise<void> {
    const existingCount = await this.projectTypesRepository.count()
    if (existingCount > 0) {
      return // Already seeded
    }

    const defaultTypes = [
      // Web Development
      { value: 'website', label: '🌐 Website', category: 'Web Development', description: 'Static or dynamic websites', icon: '🌐', orderIndex: 1 },
      { value: 'web_app', label: '💻 Web Application', category: 'Web Development', description: 'Interactive web applications', icon: '💻', orderIndex: 2 },
      { value: 'spa', label: '⚡ Single Page App', category: 'Web Development', description: 'React, Vue, Angular applications', icon: '⚡', orderIndex: 3 },
      { value: 'ecommerce', label: '🛒 E-commerce Platform', category: 'Web Development', description: 'Online stores and marketplaces', icon: '🛒', orderIndex: 4 },
      
      // Mobile Development  
      { value: 'mobile_app', label: '📱 Mobile App', category: 'Mobile Development', description: 'Native mobile applications', icon: '📱', orderIndex: 1 },
      { value: 'ios_app', label: '🍎 iOS App', category: 'Mobile Development', description: 'Native iOS applications', icon: '🍎', orderIndex: 2 },
      { value: 'android_app', label: '🤖 Android App', category: 'Mobile Development', description: 'Native Android applications', icon: '🤖', orderIndex: 3 },
      
      // Backend Development
      { value: 'api', label: '🔌 REST API', category: 'Backend Development', description: 'RESTful web services', icon: '🔌', orderIndex: 1 },
      { value: 'microservices', label: '🧩 Microservices', category: 'Backend Development', description: 'Distributed microservice architecture', icon: '🧩', orderIndex: 2 },
      { value: 'serverless', label: '☁️ Serverless Functions', category: 'Backend Development', description: 'AWS Lambda, Vercel Functions, etc.', icon: '☁️', orderIndex: 3 },
      
      // Data & Analytics
      { value: 'dashboard', label: '📈 Analytics Dashboard', category: 'Data Analytics', description: 'Business intelligence dashboards', icon: '📈', orderIndex: 1 },
      { value: 'ml_model', label: '🤖 Machine Learning Model', category: 'AI/ML', description: 'ML model development and deployment', icon: '🤖', orderIndex: 1 },
      
      // Business
      { value: 'consulting', label: '💼 Technical Consulting', category: 'Consulting', description: 'Technical advisory services', icon: '💼', orderIndex: 1 },
      { value: 'maintenance', label: '🔧 Maintenance & Support', category: 'Maintenance', description: 'Ongoing system maintenance', icon: '🔧', orderIndex: 1 }
    ]

    for (const typeData of defaultTypes) {
      const projectType = this.projectTypesRepository.create({
        ...typeData,
        isCustom: false,
        isActive: true
      })
      await this.projectTypesRepository.save(projectType)
    }
  }
}