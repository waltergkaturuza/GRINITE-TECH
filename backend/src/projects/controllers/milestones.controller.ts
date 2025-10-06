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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MilestonesService } from '../services/milestones.service';
import { CreateMilestoneDto, UpdateMilestoneDto } from '../dto/milestone.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('Milestones')
@Controller('milestones')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class MilestonesController {
  constructor(private readonly milestonesService: MilestonesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Create a new milestone' })
  create(@Body() createMilestoneDto: CreateMilestoneDto) {
    return this.milestonesService.create(createMilestoneDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get all milestones' })
  findAll(@Query('projectId') projectId?: string) {
    return this.milestonesService.findAll(projectId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get milestone by ID' })
  findOne(@Param('id') id: string) {
    return this.milestonesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Update milestone' })
  update(@Param('id') id: string, @Body() updateMilestoneDto: UpdateMilestoneDto) {
    return this.milestonesService.update(id, updateMilestoneDto);
  }

  @Patch(':id/progress')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Update milestone progress from modules' })
  updateProgress(@Param('id') id: string) {
    return this.milestonesService.updateProgress(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete milestone' })
  remove(@Param('id') id: string) {
    return this.milestonesService.remove(id);
  }
}
