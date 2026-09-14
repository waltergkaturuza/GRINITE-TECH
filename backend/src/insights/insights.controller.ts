import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InsightsService } from './insights.service';
import {
  CreateCommentDto,
  CreateInsightDto,
  CreateQuestionDto,
  InsightFilterDto,
  SubscribeInsightDto,
  UpdateCommentDto,
  UpdateInsightDto,
  VoteCommentDto,
} from './dto/insight.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Get()
  findPublished(@Query() filters: InsightFilterDto) {
    return this.insightsService.findPublished(filters);
  }

  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.STAFF)
  findAllAdmin(@Query() filters: InsightFilterDto) {
    return this.insightsService.findAllAdmin(filters);
  }

  @Get('admin/comments')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.STAFF)
  listCommentsAdmin() {
    return this.insightsService.listCommentsAdmin();
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.STAFF)
  create(@Body() dto: CreateInsightDto, @CurrentUser() user: any) {
    return this.insightsService.create(dto, user);
  }

  @Post('questions')
  @UseGuards(OptionalJwtAuthGuard)
  askQuestion(@Body() dto: CreateQuestionDto, @CurrentUser() user: any) {
    return this.insightsService.createQuestion(dto, user);
  }

  @Post('subscribe')
  subscribe(@Body() dto: SubscribeInsightDto) {
    return this.insightsService.subscribe(dto);
  }

  @Get('unsubscribe')
  unsubscribe(@Query('token') token: string) {
    return this.insightsService.unsubscribe(token);
  }

  @Get('admin/subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.STAFF)
  listSubscribers() {
    return this.insightsService.listSubscribers();
  }

  @Post('comments/:id/vote')
  @UseGuards(OptionalJwtAuthGuard)
  vote(
    @Param('id') id: string,
    @Body() dto: VoteCommentDto,
    @CurrentUser() user: any,
    @Req() req: any,
  ) {
    const voterKey = dto.voterKey || req.ip || 'anonymous';
    return this.insightsService.voteComment(id, dto.value as 1 | -1, voterKey, user);
  }

  @Post('comments/:id/accept')
  @UseGuards(JwtAuthGuard)
  accept(@Param('id') id: string, @CurrentUser() user: any) {
    return this.insightsService.acceptComment(id, user);
  }

  @Patch('comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.STAFF)
  updateComment(@Param('id') id: string, @Body() dto: UpdateCommentDto) {
    return this.insightsService.updateComment(id, dto);
  }

  @Delete('comments/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.STAFF)
  removeComment(@Param('id') id: string) {
    return this.insightsService.removeComment(id);
  }

  @Get(':slug/comments')
  listComments(@Param('slug') slug: string) {
    return this.insightsService.listComments(slug);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.insightsService.findBySlug(slug, true);
  }

  @Post(':slug/comments')
  @UseGuards(OptionalJwtAuthGuard)
  addComment(
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: any,
  ) {
    return this.insightsService.addComment(slug, dto, user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER, UserRole.STAFF)
  update(@Param('id') id: string, @Body() dto: UpdateInsightDto) {
    return this.insightsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.DEVELOPER)
  remove(@Param('id') id: string) {
    return this.insightsService.remove(id);
  }
}
