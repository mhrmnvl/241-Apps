import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
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
import { MyPayslipQueryDto } from '../dto/request/my-payslip-query.dto.js';
import {
  PayslipResponseDto,
  PayslipSummaryResponseDto,
} from '../dto/response/payslip.response.dto.js';
import { GetMyPayslipUseCase } from '../use-cases/get-my-payslip.use-case.js';
import {
  GetPayslipByIdUseCase,
  GetRunPayslipsUseCase,
} from '../use-cases/get-payslip-by-id.use-case.js';

@ApiTags('Payroll — Payslips')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@UseFilters(PayrollAccessFilter)
@Controller('payroll')
export class PayslipController {
  constructor(
    private readonly getMine: GetMyPayslipUseCase,
    private readonly getById: GetPayslipByIdUseCase,
    private readonly getForRun: GetRunPayslipsUseCase,
  ) {}

  /** Declared before `payslips/:id` so `me` is never read as an id. */
  @Get('payslips/me')
  @RequirePermissions('payroll-payslips.read-own')
  @ApiOperation({
    summary: 'My payslip — resolved from the token, approved runs only',
  })
  async mine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: MyPayslipQueryDto,
  ): Promise<PayslipResponseDto> {
    return this.getMine.execute(user.id, query);
  }

  @Get('payslips/:id')
  @RequirePermissions('payroll-payslips.read')
  @ApiParam({ name: 'id', format: 'uuid' })
  async detail(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PayslipResponseDto> {
    return this.getById.execute(id, user.id);
  }

  @Get('runs/:id/payslips')
  @RequirePermissions('payroll-payslips.read')
  @ApiParam({ name: 'id', format: 'uuid' })
  async forRun(
    @Param('id', ParseUUIDPipe) runId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PayslipSummaryResponseDto[]> {
    return this.getForRun.execute(runId, user.id);
  }
}
