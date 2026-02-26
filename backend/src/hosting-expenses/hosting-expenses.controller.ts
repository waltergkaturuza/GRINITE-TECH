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
import { HostingExpensesService } from './hosting-expenses.service';
import { CreateHostingExpenseDto } from './dto/create-hosting-expense.dto';
import { UpdateHostingExpenseDto } from './dto/update-hosting-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('hosting-expenses')
@ApiBearerAuth()
@Controller('hosting-expenses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class HostingExpensesController {
  constructor(private readonly hostingExpensesService: HostingExpensesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a hosting expense' })
  create(@Body() dto: CreateHostingExpenseDto) {
    return this.hostingExpensesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List hosting expenses with filters' })
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('projectId') projectId?: string,
    @Query('status') status?: string,
    @Query('provider') provider?: string,
  ) {
    return this.hostingExpensesService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
      projectId,
      status,
      provider,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hosting expense by ID' })
  findOne(@Param('id') id: string) {
    return this.hostingExpensesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a hosting expense' })
  update(@Param('id') id: string, @Body() dto: UpdateHostingExpenseDto) {
    return this.hostingExpensesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a hosting expense' })
  remove(@Param('id') id: string) {
    return this.hostingExpensesService.remove(id);
  }
}
