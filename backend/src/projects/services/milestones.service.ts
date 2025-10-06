import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone } from '../entities/milestone.entity';
import { Project } from '../entities/project.entity';
import { CreateMilestoneDto, UpdateMilestoneDto } from '../dto/milestone.dto';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectRepository(Milestone)
    private milestonesRepository: Repository<Milestone>,
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async create(createMilestoneDto: CreateMilestoneDto): Promise<Milestone> {
    const project = await this.projectsRepository.findOne({
      where: { id: createMilestoneDto.projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const milestone = this.milestonesRepository.create({
      ...createMilestoneDto,
      project,
    });

    return this.milestonesRepository.save(milestone);
  }

  async findAll(projectId?: string): Promise<Milestone[]> {
    const where = projectId ? { project: { id: projectId } } : {};
    return this.milestonesRepository.find({
      where,
      relations: ['project', 'modules', 'modules.features'],
      order: { orderIndex: 'ASC', createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Milestone> {
    const milestone = await this.milestonesRepository.findOne({
      where: { id },
      relations: ['project', 'modules', 'modules.features'],
    });

    if (!milestone) {
      throw new NotFoundException('Milestone not found');
    }

    return milestone;
  }

  async update(id: string, updateMilestoneDto: UpdateMilestoneDto): Promise<Milestone> {
    const milestone = await this.findOne(id);
    Object.assign(milestone, updateMilestoneDto);

    if (updateMilestoneDto.progress === 100) {
      milestone.completedAt = new Date();
    }

    return this.milestonesRepository.save(milestone);
  }

  async remove(id: string): Promise<void> {
    const milestone = await this.findOne(id);
    await this.milestonesRepository.remove(milestone);
  }

  async updateProgress(id: string): Promise<Milestone> {
    const milestone = await this.findOne(id);
    
    if (!milestone.modules || milestone.modules.length === 0) {
      milestone.progress = 0;
    } else {
      const totalProgress = milestone.modules.reduce((sum, module) => sum + module.progress, 0);
      milestone.progress = Math.round(totalProgress / milestone.modules.length);
    }

    if (milestone.progress === 100 && !milestone.completedAt) {
      milestone.completedAt = new Date();
    }

    return this.milestonesRepository.save(milestone);
  }
}
