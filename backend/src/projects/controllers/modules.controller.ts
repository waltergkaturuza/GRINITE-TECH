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
import { ModulesService } from '../services/modules.service';
import { CreateModuleDto, UpdateModuleDto } from '../dto/module.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('Modules')
@Controller('modules')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ModulesController {
  constructor(private readonly modulesService: ModulesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Create a new module' })
  create(@Body() createModuleDto: CreateModuleDto) {
    return this.modulesService.create(createModuleDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get all modules' })
  findAll(@Query('milestoneId') milestoneId?: string) {
    return this.modulesService.findAll(milestoneId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get module by ID' })
  findOne(@Param('id') id: string) {
    return this.modulesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Update module' })
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.modulesService.update(id, updateModuleDto);
  }

  @Patch(':id/progress')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Update module progress from features' })
  updateProgress(@Param('id') id: string) {
    return this.modulesService.updateProgress(id);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete module' })
  remove(@Param('id') id: string) {
    return this.modulesService.remove(id);
  }
}
