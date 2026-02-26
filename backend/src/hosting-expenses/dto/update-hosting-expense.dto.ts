import { PartialType } from '@nestjs/mapped-types';
import { CreateHostingExpenseDto } from './create-hosting-expense.dto';

export class UpdateHostingExpenseDto extends PartialType(CreateHostingExpenseDto) {}
