import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CreateCompanyDocumentDto, UpdateCompanyDocumentDto } from './dto/document.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';
import {
  COMPANY_DOCUMENT_CATEGORIES,
  PROJECT_DOCUMENT_CATEGORIES,
} from './entities/company-document.entity';

type AuthUser = { userId?: string; role?: string };

@ApiTags('documents')
@ApiBearerAuth()
@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.CLIENT)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('categories')
  @ApiOperation({ summary: 'List document categories and counts' })
  async categories(
    @Query('projectId') projectId?: string,
    @Query('scope') scope?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    const counts = await this.documentsService.categoryCounts({ projectId, scope }, user);
    return {
      company: COMPANY_DOCUMENT_CATEGORIES,
      project: PROJECT_DOCUMENT_CATEGORIES,
      counts,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List company and project documents' })
  findAll(
    @Query('category') category?: string,
    @Query('projectId') projectId?: string,
    @Query('scope') scope?: string,
    @Query('search') search?: string,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.documentsService.findAll({ category, projectId, scope, search }, user);
  }

  @Post()
  @ApiOperation({ summary: 'Register an uploaded document' })
  create(@Body() dto: CreateCompanyDocumentDto, @CurrentUser() user: AuthUser) {
    return this.documentsService.create(dto, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.documentsService.findOne(id, user);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDocumentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.documentsService.update(id, dto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.documentsService.remove(id, user);
  }
}
