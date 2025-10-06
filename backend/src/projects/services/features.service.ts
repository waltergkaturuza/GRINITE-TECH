import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Feature } from '../entities/feature.entity';
import { Module } from '../entities/module.entity';
import { CreateFeatureDto, UpdateFeatureDto } from '../dto/feature.dto';

@Injectable()
export class FeaturesService {
  constructor(
    @InjectRepository(Feature)
    private featuresRepository: Repository<Feature>,
    @InjectRepository(Module)
    private modulesRepository: Repository<Module>,
  ) {}

  async create(createFeatureDto: CreateFeatureDto): Promise<Feature> {
    const module = await this.modulesRepository.findOne({
      where: { id: createFeatureDto.moduleId },
    });

    if (!module) {
      throw new NotFoundException('Module not found');
    }

    const feature = this.featuresRepository.create({
      ...createFeatureDto,
      module,
    });

    return this.featuresRepository.save(feature);
  }

  async findAll(moduleId?: string): Promise<Feature[]> {
    const where = moduleId ? { module: { id: moduleId } } : {};
    return this.featuresRepository.find({
      where,
      relations: ['module'],
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Feature> {
    const feature = await this.featuresRepository.findOne({
      where: { id },
      relations: ['module'],
    });

    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    return feature;
  }

  async update(id: string, updateFeatureDto: UpdateFeatureDto): Promise<Feature> {
    const feature = await this.findOne(id);
    Object.assign(feature, updateFeatureDto);

    if (updateFeatureDto.isCompleted && !feature.completedAt) {
      feature.completedAt = new Date();
    } else if (updateFeatureDto.isCompleted === false) {
      feature.completedAt = null;
    }

    return this.featuresRepository.save(feature);
  }

  async toggle(id: string, isCompleted: boolean): Promise<Feature> {
    const feature = await this.findOne(id);
    feature.isCompleted = isCompleted;
    
    if (isCompleted && !feature.completedAt) {
      feature.completedAt = new Date();
    } else if (!isCompleted) {
      feature.completedAt = null;
    }

    return this.featuresRepository.save(feature);
  }

  async remove(id: string): Promise<void> {
    const feature = await this.findOne(id);
    await this.featuresRepository.remove(feature);
  }
}
