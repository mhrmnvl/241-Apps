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
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { PayrollAccessFilter } from '../../shared/filters/payroll-access.filter.js';
import { PayrollAuditService } from '../../shared/services/payroll-audit.service.js';
import { PayrollRunWithTotals } from '../domain/entities/payroll-run.entity.js';
import { CreatePayrollRunDto } from '../dto/request/create-payroll-run.dto.js';
import { PayrollRunQueryDto } from '../dto/request/payroll-run-query.dto.js';
import { ApprovePayrollRunUseCase } from '../use-cases/approve-payroll-run.use-case.js';
import { CreatePayrollRunUseCase } from '../use-cases/create-payroll-run.use-case.js';
import {
  GetPayrollRunByIdUseCase,
  GetPayrollRunsUseCase,
} from '../use-cases/get-payroll-runs.use-case.js';
import {
  RecalculatePayrollRunUseCase,
  RecalculatedRun,
} from '../use-cases/recalculate-payroll-run.use-case.js';
import { SubmitPayrollRunUseCase } from '../use-cases/submit-payroll-run.use-case.js';

/**
 * `payroll-runs.create` calculates the month; `payroll-salaries.update` decides
 * what anyone is paid. They are separate on purpose (FR-043).
 */
@ApiTags('Payroll — Runs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseFilters(PayrollAccessFilter)
@Controller('payroll/runs')
export class PayrollRunController {
  constructor(
    private readonly getAll: GetPayrollRunsUseCase,
    private readonly getById: GetPayrollRunByIdUseCase,
    private readonly createUC: CreatePayrollRunUseCase,
    private readonly recalculateUC: RecalculatePayrollRunUseCase,
    private readonly submitUC: SubmitPayrollRunUseCase,
    private readonly approveUC: ApprovePayrollRunUseCase,
    private readonly audit: PayrollAuditService,
  ) {}

  @Get()
  @RequirePermissions('payroll-runs.read')
  async list(
    @Query() query: PayrollRunQueryDto,
  ): Promise<PayrollRunWithTotals[]> {
    return this.getAll.execute(query);
  }

  @Get(':id')
  @RequirePermissions('payroll-runs.read')
  @ApiParam({ name: 'id', format: 'uuid' })
  async detail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PayrollRunWithTotals> {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('payroll-runs.create')
  @ApiOperation({ summary: 'Calculate a closed month into a DRAFT run' })
  async create(
    @Body() dto: CreatePayrollRunDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PayrollRunWithTotals> {
    const run = await this.createUC.execute(dto, user.id);
    await this.audit.record('payroll.run.create', user.id, run.id, {
      year: run.year,
      month: run.month,
      kind: run.kind,
      net: run.totals.net,
    });

    return run;
  }

  @Post(':id/recalculate')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('payroll-runs.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Recompute a draft and report what moved' })
  async recalculate(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RecalculatedRun> {
    const run = await this.recalculateUC.execute(id);
    await this.audit.record('payroll.run.recalculate', user.id, id, {
      changed: run.previousDraft.changedPayslips.length,
      net: run.totals.net,
    });

    return run;
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('payroll-runs.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  async submit(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PayrollRunWithTotals> {
    const run = await this.submitUC.execute(id, user.id);
    await this.audit.record('payroll.run.submit', user.id, id, {
      net: run.totals.net,
    });

    return run;
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('payroll-runs.approve')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({
    summary: 'Final. An approved run is corrected by adjustment',
  })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PayrollRunWithTotals> {
    const run = await this.approveUC.execute(id, user.id);
    await this.audit.record('payroll.run.approve', user.id, id, {
      net: run.totals.net,
      employees: run.totals.employeeCount,
    });

    return run;
  }
}
