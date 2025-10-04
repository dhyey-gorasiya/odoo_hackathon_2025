import { Body, Controller, Get, Param, Post, Put, Delete, Query } from '@nestjs/common';
import { ApprovalRuleService } from './approval-rule.service';
import { CreateApprovalRuleDto } from './approval-rule.dto';

@Controller('approval-rules')
export class ApprovalRuleController {
  constructor(private readonly approvalRuleService: ApprovalRuleService) {}

  @Post()
  async createRule(@Body() dto: CreateApprovalRuleDto) {
    return this.approvalRuleService.createRule(dto);
  }

  @Get(':id')
  async getRuleById(@Param('id') id: string) {
    return this.approvalRuleService.getRuleById(id);
  }

  @Get()
  async getRulesByCompany(@Query('companyId') companyId: string) {
    return this.approvalRuleService.getRulesByCompany(companyId);
  }

  @Put(':id')
  async updateRule(@Param('id') id: string, @Body() updates: Partial<CreateApprovalRuleDto>) {
    return this.approvalRuleService.updateRule(id, updates);
  }

  @Delete(':id')
  async deleteRule(@Param('id') id: string) {
    return this.approvalRuleService.deleteRule(id);
  }
}
