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
import { FeaturesService } from '../services/features.service';
import { CreateFeatureDto, UpdateFeatureDto, ToggleFeatureDto } from '../dto/feature.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../users/entities/user.entity';

@ApiTags('Features')
@Controller('features')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class FeaturesController {
  constructor(private readonly featuresService: FeaturesService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Create a new feature' })
  create(@Body() createFeatureDto: CreateFeatureDto) {
    return this.featuresService.create(createFeatureDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get all features' })
  findAll(@Query('moduleId') moduleId?: string) {
    return this.featuresService.findAll(moduleId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.CLIENT)
  @ApiOperation({ summary: 'Get feature by ID' })
  findOne(@Param('id') id: string) {
    return this.featuresService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Update feature' })
  update(@Param('id') id: string, @Body() updateFeatureDto: UpdateFeatureDto) {
    return this.featuresService.update(id, updateFeatureDto);
  }

  @Patch(':id/toggle')
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Toggle feature completion' })
  toggle(@Param('id') id: string, @Body() toggleDto: ToggleFeatureDto) {
    return this.featuresService.toggle(id, toggleDto.isCompleted);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete feature' })
  remove(@Param('id') id: string) {
    return this.featuresService.remove(id);
  }
}
