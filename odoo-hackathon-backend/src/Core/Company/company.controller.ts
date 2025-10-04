import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Res,
  Param,
  Logger,
  UseGuards,
} from '@nestjs/common';
import { CompanyDto } from './company.dto';
import { AuthGuard } from '@nestjs/passport';
import { CompanyService } from './company.service';

@Controller('company')
export class CompanyController {
  private readonly logger = new Logger(CompanyController.name);

  constructor(private companyService: CompanyService) {}

  @Post('add')
  async addCompany(@Body() dto: CompanyDto, @Res() res) {
    const result = await this.companyService.addItem(dto);
    return res.status(result.status).send(result);
  }

  @Post('login')
  async login(@Res() res, @Body() body: { email: string; password: string }) {
    const result = await this.companyService.login(body.email, body.password);
    return res.status(result.status).send(result);
  }

  @Get('all')
  async getAllCompanies(@Res() res) {
    const result = await this.companyService.getAllItems();
    return res.status(result.status).send(result);
  }

  @Get(':id')
  async getCompanyById(@Param('id') id: string, @Res() res) {
    const result = await this.companyService.getItemById(id);
    return res.status(result.status).send(result);
  }

  @Put('update/:id')
  async updateCompany(
    @Param('id') id: string,
    @Body() dto: CompanyDto,
    @Res() res,
  ) {
    const result = await this.companyService.updateItem(id, dto);
    return res.status(result.status).send(result);
  }

  @Delete('delete/:id')
  async deleteCompany(@Param('id') id: string, @Res() res) {
    const result = await this.companyService.deleteItem(id);
    return res.status(result.status).send(result);
  }
}
