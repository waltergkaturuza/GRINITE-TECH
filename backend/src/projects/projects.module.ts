import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Milestone } from './entities/milestone.entity';
import { Module as ProjectModule } from './entities/module.entity';
import { Feature } from './entities/feature.entity';
import { ProjectType } from '../entities/project-type.entity';
import { User } from '../users/entities/user.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MilestonesController } from './controllers/milestones.controller';
import { MilestonesService } from './services/milestones.service';
import { ModulesController } from './controllers/modules.controller';
import { ModulesService } from './services/modules.service';
import { FeaturesController } from './controllers/features.controller';
import { FeaturesService } from './services/features.service';
import { ProjectTypesController } from '../services/project-types.controller';
import { ProjectTypesService } from '../services/project-types.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Milestone,
      ProjectModule,
      Feature,
      ProjectType,
      User,
    ]),
  ],
  providers: [
    ProjectsService,
    MilestonesService,
    ModulesService,
    FeaturesService,
    ProjectTypesService,
  ],
  controllers: [
    ProjectsController,
    MilestonesController,
    ModulesController,
    FeaturesController,
    ProjectTypesController,
  ],
  exports: [ProjectsService, MilestonesService, ModulesService, FeaturesService, ProjectTypesService],
})
export class ProjectsModule {}