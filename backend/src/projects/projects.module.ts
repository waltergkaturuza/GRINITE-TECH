import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Milestone } from './entities/milestone.entity';
import { Module as ProjectModule } from './entities/module.entity';
import { Feature } from './entities/feature.entity';
import { User } from '../users/entities/user.entity';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { MilestonesController } from './controllers/milestones.controller';
import { MilestonesService } from './services/milestones.service';
import { ModulesController } from './controllers/modules.controller';
import { ModulesService } from './services/modules.service';
import { FeaturesController } from './controllers/features.controller';
import { FeaturesService } from './services/features.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Milestone,
      ProjectModule,
      Feature,
      User,
    ]),
  ],
  providers: [
    ProjectsService,
    MilestonesService,
    ModulesService,
    FeaturesService,
  ],
  controllers: [
    ProjectsController,
    MilestonesController,
    ModulesController,
    FeaturesController,
  ],
  exports: [ProjectsService, MilestonesService, ModulesService, FeaturesService],
})
export class ProjectsModule {}