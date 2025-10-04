import { Body, Controller, Get, Param, Post, Put, Delete, Query } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './expense.dto';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async createExpense(@Body() dto: CreateExpenseDto) {
    return this.expenseService.createExpense(dto);
  }

  @Get(':id')
  async getExpenseById(@Param('id') id: string) {
    return this.expenseService.getExpenseById(id);
  }

  @Get()
  async getAllExpenses(@Query('companyId') companyId: string) {
    return this.expenseService.getAllExpenses(companyId);
  }

  @Put(':id')
  async updateExpense(@Param('id') id: string, @Body() updates: Partial<CreateExpenseDto>) {
    return this.expenseService.updateExpense(id, updates);
  }

  @Delete(':id')
  async deleteExpense(@Param('id') id: string) {
    return this.expenseService.deleteExpense(id);
  }
}
