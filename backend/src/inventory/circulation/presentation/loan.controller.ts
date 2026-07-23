import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { CreateLoanDto } from '../dto/request/create-loan.dto.js';
import { ReturnLoanDto } from '../dto/request/return-loan.dto.js';
import { LoanQueryDto } from '../dto/request/loan-query.dto.js';
import { CreateLoanUseCase } from '../use-cases/create-loan.use-case.js';
import { ReturnLoanUseCase } from '../use-cases/return-loan.use-case.js';
import { GetLoansUseCase } from '../use-cases/get-loans.use-case.js';
import { GetLoanByIdUseCase } from '../use-cases/get-loan-by-id.use-case.js';

@ApiTags('Inventory Loans')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory/loans')
export class LoanController {
  constructor(
    private readonly getLoansUseCase: GetLoansUseCase,
    private readonly getLoanByIdUseCase: GetLoanByIdUseCase,
    private readonly createLoanUseCase: CreateLoanUseCase,
    private readonly returnLoanUseCase: ReturnLoanUseCase,
  ) {}

  @Get()
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'List all loan transactions' })
  async findAll(@Query() query: LoanQueryDto) {
    return this.getLoansUseCase.execute(query);
  }

  @Get(':id')
  @RequirePermissions('inventory.read')
  @ApiOperation({ summary: 'Get loan transaction by ID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getLoanByIdUseCase.execute(id);
  }

  @Post()
  @RequirePermissions('inventory.create')
  @ApiOperation({ summary: 'Request a new loan' })
  async create(
    @Body() dto: CreateLoanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createLoanUseCase.execute(dto, user.id);
  }

  @Post(':id/return')
  @RequirePermissions('inventory.update')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Return borrowed assets' })
  async returnLoan(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReturnLoanDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.returnLoanUseCase.execute(id, dto, user.id);
  }
}
