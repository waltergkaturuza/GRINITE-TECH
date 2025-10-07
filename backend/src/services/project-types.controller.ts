import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger'
import { ProjectTypesService } from '../services/project-types.service'
import { CreateProjectTypeDto, UpdateProjectTypeDto } from '../dto/project-type.dto'
import { ProjectType } from '../entities/project-type.entity'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../users/entities/user.entity'

@ApiTags('project-types')
@Controller('project-types')
@UseGuards(JwtAuthGuard)
export class ProjectTypesController {
  constructor(private readonly projectTypesService: ProjectTypesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all project types' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean, description: 'Include inactive project types' })
  @ApiQuery({ name: 'category', required: false, type: String, description: 'Filter by category' })
  @ApiResponse({ status: 200, description: 'List of project types', type: [ProjectType] })
  async findAll(
    @Query('includeInactive') includeInactive?: boolean,
    @Query('category') category?: string
  ): Promise<ProjectType[]> {
    if (category) {
      return this.projectTypesService.findByCategory(category)
    }
    return this.projectTypesService.findAll(includeInactive)
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all project type categories' })
  @ApiResponse({ status: 200, description: 'List of categories', type: [String] })
  async getCategories(): Promise<string[]> {
    return this.projectTypesService.findCategories()
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project type by ID' })
  @ApiResponse({ status: 200, description: 'Project type details', type: ProjectType })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  async findOne(@Param('id') id: string): Promise<ProjectType> {
    return this.projectTypesService.findOne(id)
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new project type' })
  @ApiResponse({ status: 201, description: 'Project type created successfully', type: ProjectType })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'Project type value already exists' })
  async create(@Body() createProjectTypeDto: CreateProjectTypeDto): Promise<ProjectType> {
    return this.projectTypesService.create(createProjectTypeDto)
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update project type' })
  @ApiResponse({ status: 200, description: 'Project type updated successfully', type: ProjectType })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  @ApiResponse({ status: 409, description: 'Project type value already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateProjectTypeDto: UpdateProjectTypeDto
  ): Promise<ProjectType> {
    return this.projectTypesService.update(id, updateProjectTypeDto)
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete custom project type' })
  @ApiResponse({ status: 204, description: 'Project type deleted successfully' })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  @ApiResponse({ status: 409, description: 'Cannot delete system project types' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.projectTypesService.remove(id)
  }

  @Patch(':id/deactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deactivate project type' })
  @ApiResponse({ status: 200, description: 'Project type deactivated', type: ProjectType })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  async deactivate(@Param('id') id: string): Promise<ProjectType> {
    return this.projectTypesService.deactivate(id)
  }

  @Patch(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reactivate project type' })
  @ApiResponse({ status: 200, description: 'Project type reactivated', type: ProjectType })
  @ApiResponse({ status: 404, description: 'Project type not found' })
  async reactivate(@Param('id') id: string): Promise<ProjectType> {
    return this.projectTypesService.reactivate(id)
  }

  @Post('seed')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Seed default project types (admin only)' })
  @ApiResponse({ status: 200, description: 'Default project types seeded successfully' })
  async seedDefaultTypes(): Promise<{ message: string }> {
    await this.projectTypesService.seedDefaultTypes()
    return { message: 'Default project types seeded successfully' }
  }
}