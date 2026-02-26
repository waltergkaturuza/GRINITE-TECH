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
import { LedgerService } from './ledger.service';
import { CreateLedgerAccountDto } from './dto/create-ledger-account.dto';
import { UpdateLedgerAccountDto } from './dto/update-ledger-account.dto';
import { CreateLedgerEntryDto } from './dto/create-ledger-entry.dto';
import { UpdateLedgerEntryDto } from './dto/update-ledger-entry.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ledger')
@ApiBearerAuth()
@Controller('ledger')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  // Accounts
  @Post('accounts')
  createAccount(@Body() dto: CreateLedgerAccountDto) {
    return this.ledgerService.createAccount(dto);
  }

  @Get('accounts')
  findAllAccounts() {
    return this.ledgerService.findAllAccounts();
  }

  @Get('accounts/balances')
  getAccountsWithBalances() {
    return this.ledgerService.getAccountsWithBalances();
  }

  @Get('accounts/:id')
  findOneAccount(@Param('id') id: string) {
    return this.ledgerService.findOneAccount(id);
  }

  @Get('accounts/:id/balance')
  getAccountBalance(@Param('id') id: string) {
    return this.ledgerService.getAccountBalance(id);
  }

  @Patch('accounts/:id')
  updateAccount(@Param('id') id: string, @Body() dto: UpdateLedgerAccountDto) {
    return this.ledgerService.updateAccount(id, dto);
  }

  @Delete('accounts/:id')
  removeAccount(@Param('id') id: string) {
    return this.ledgerService.removeAccount(id);
  }

  // Entries
  @Post('entries')
  createEntry(@Body() dto: CreateLedgerEntryDto) {
    return this.ledgerService.createEntry(dto);
  }

  @Get('accounts/:accountId/entries')
  findEntriesByAccount(
    @Param('accountId') accountId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.ledgerService.findEntriesByAccount(accountId, {
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0,
    });
  }

  @Get('entries/:id')
  findOneEntry(@Param('id') id: string) {
    return this.ledgerService.findOneEntry(id);
  }

  @Patch('entries/:id')
  updateEntry(@Param('id') id: string, @Body() dto: UpdateLedgerEntryDto) {
    return this.ledgerService.updateEntry(id, dto);
  }

  @Delete('entries/:id')
  removeEntry(@Param('id') id: string) {
    return this.ledgerService.removeEntry(id);
  }
}
