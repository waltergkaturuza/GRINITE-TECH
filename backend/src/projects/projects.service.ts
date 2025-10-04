import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Project, ProjectStatus } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { User } from '../users/entities/user.entity';

interface QueryParams {
  page: number;
  limit: number;
  status?: string;
  type?: string;
  clientId?: string;
  search?: string;
}

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createProjectDto: CreateProjectDto, user: User): Promise<Project> {
    const project = this.projectRepository.create({
      ...createProjectDto,
      client: createProjectDto.clientId 
        ? await this.userRepository.findOne({ where: { id: createProjectDto.clientId } })
        : null,
    });

    return this.projectRepository.save(project);
  }

  async findAll(queryParams: QueryParams, user: User) {
    const { page, limit, status, type, clientId, search } = queryParams;
    const skip = (page - 1) * limit;

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.client', 'client')
      .orderBy('project.createdAt', 'DESC');

    // Apply filters
    if (status) {
      queryBuilder.andWhere('project.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('project.type = :type', { type });
    }

    if (clientId) {
      queryBuilder.andWhere('project.client.id = :clientId', { clientId });
    }

    if (search) {
      queryBuilder.andWhere(
        '(project.title ILIKE :search OR project.description ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Get total count for pagination
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const projects = await queryBuilder.getMany();

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, user: User): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['client'],
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: User): Promise<Project> {
    const project = await this.findOne(id, user);

    // If clientId is being updated, fetch the new client
    if (updateProjectDto.clientId) {
      const client = await this.userRepository.findOne({
        where: { id: updateProjectDto.clientId }
      });
      if (client) {
        project.client = client;
      }
    }

    // Update other fields
    Object.assign(project, updateProjectDto);

    return this.projectRepository.save(project);
  }

  async remove(id: string, user: User): Promise<void> {
    const project = await this.findOne(id, user);
    await this.projectRepository.remove(project);
  }

  async findByStatus(status: string, user: User): Promise<Project[]> {
    return this.projectRepository.find({
      where: { status: status as ProjectStatus },
      relations: ['client'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats(user: User) {
    const projects = await this.projectRepository.find({
      relations: ['client'],
    });

    const total = projects.length;
    const planning = projects.filter(p => p.status === ProjectStatus.PLANNING).length;
    const inProgress = projects.filter(p => p.status === ProjectStatus.IN_PROGRESS).length;
    const review = projects.filter(p => p.status === ProjectStatus.REVIEW).length;
    const completed = projects.filter(p => p.status === ProjectStatus.COMPLETED).length;
    const cancelled = projects.filter(p => p.status === ProjectStatus.CANCELLED).length;

    const totalBudget = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    const totalActualHours = projects.reduce((sum, project) => sum + (project.actualHours || 0), 0);
    const averageCompletion = total > 0 
      ? projects.reduce((sum, project) => sum + project.completionPercentage, 0) / total 
      : 0;

    return {
      total,
      planning,
      inProgress,
      review,
      completed,
      cancelled,
      totalBudget,
      totalActualHours,
      averageCompletion: Math.round(averageCompletion * 100) / 100,
    };
  }
}