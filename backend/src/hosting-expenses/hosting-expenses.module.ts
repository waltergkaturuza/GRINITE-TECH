import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HostingExpense } from './entities/hosting-expense.entity';
import { HostingExpensesService } from './hosting-expenses.service';
import { HostingExpensesController } from './hosting-expenses.controller';

@Module({
  imports: [TypeOrmModule.forFeature([HostingExpense])],
  controllers: [HostingExpensesController],
  providers: [HostingExpensesService],
  exports: [HostingExpensesService],
})
export class HostingExpensesModule {}
