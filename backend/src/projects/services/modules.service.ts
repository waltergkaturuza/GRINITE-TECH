import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Module } from '../entities/module.entity';
import { Milestone } from '../entities/milestone.entity';
import { CreateModuleDto, UpdateModuleDto } from '../dto/module.dto';

@Injectable()
export class ModulesService {
  constructor(
    @InjectRepository(Module)
    private modulesRepository: Repository<Module>,
    @InjectRepository(Milestone)
    private milestonesRepository: Repository<Milestone>,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    const milestone = await this.milestonesRepository.findOne({
      where: { id: createModuleDto.milestoneId },
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    const module = this.modulesRepository.create({
      ...createModuleDto,
      milestone,
    });

    return this.modulesRepository.save(module);
  }

  async findAll(milestoneId?: string): Promise<Module[]> {
    const where = milestoneId ? { milestone: { id: milestoneId } } : {};
    return this.modulesRepository.find({
      where,
      relations: ['milestone', 'features'],
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Module> {
    const module = await this.modulesRepository.findOne({
      where: { id },
      relations: ['milestone', 'features'],
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    return module;
  }

  async update(id: string, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const module = await this.findOne(id);
    Object.assign(module, updateModuleDto);

    if (updateModuleDto.progress === 100 && !module.completedAt) {
      module.completedAt = new Date();
    }

    return this.modulesRepository.save(module);
  }

  async remove(id: string): Promise<void> {
    const module = await this.findOne(id);
    await this.modulesRepository.remove(module);
  }

  async updateProgress(id: string): Promise<Module> {
    const module = await this.findOne(id);
    
    if (!module.features || module.features.length === 0) {
      module.progress = 0;
    } else {
      const completedFeatures = module.features.filter(f => f.isCompleted).length;
      module.progress = Math.round((completedFeatures / module.features.length) * 100);
    }

    if (module.progress === 100 && !module.completedAt) {
      module.completedAt = new Date();
    }

    return this.modulesRepository.save(module);
  }
}
