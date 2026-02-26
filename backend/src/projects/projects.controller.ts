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
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { UpdateIndicatorProgressDto, BulkUpdateIndicatorsDto } from './dto/update-indicator.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto, @CurrentUser() user: User) {
    return this.projectsService.create(createProjectDto, user);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('type') type?: string,
    @Query('clientId') clientId?: string,
    @Query('search') search?: string,
  ) {
    const queryParams = {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      status,
      type,
      clientId,
      search,
    };
    return this.projectsService.findAll(queryParams, user);
  }

  @Get('stats')
  getStats(@CurrentUser() user: User) {
    return this.projectsService.getStats(user);
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string, @CurrentUser() user: User) {
    return this.projectsService.findByStatus(status, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.update(id, updateProjectDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.projectsService.remove(id, user);
  }

  @Patch(':id/indicators/update')
  updateIndicatorProgress(
    @Param('id') id: string,
    @Body() dto: UpdateIndicatorProgressDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.updateIndicatorProgress(
      id,
      dto.indicatorId,
      {
        currentValue: dto.currentValue,
        incrementBy: dto.incrementBy,
        status: dto.status,
        notes: dto.notes,
      },
      user,
    );
  }

  @Patch(':id/indicators/bulk')
  bulkUpdateIndicators(
    @Param('id') id: string,
    @Body() dto: BulkUpdateIndicatorsDto,
    @CurrentUser() user: User,
  ) {
    return this.projectsService.bulkUpdateIndicatorProgress(
      id,
      dto.updates,
      dto.notes,
      user,
    );
  }
}