import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
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
import type { AttendancePeriodEntity } from '../domain/entities/attendance-period.entity.js';
import { CloseAttendancePeriodUseCase } from '../use-cases/close-attendance-period.use-case.js';
import { GetAttendancePeriodsUseCase } from '../use-cases/get-attendance-periods.use-case.js';

@ApiTags('Presence — Attendance Periods')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('presence/periods')
export class AttendancePeriodController {
  constructor(
    private readonly getAll: GetAttendancePeriodsUseCase,
    private readonly closeUC: CloseAttendancePeriodUseCase,
  ) {}

  @Get()
  @RequirePermissions('presence-records.read')
  @ApiOperation({ summary: 'Periods that have been closed' })
  async list(@Query('year') year?: string): Promise<AttendancePeriodEntity[]> {
    return this.getAll.execute(year ? { year: Number(year) } : {});
  }

  /**
   * Separated from `presence-records.update` on purpose: whoever corrects daily
   * attendance should not also be the one who declares the month final, because
   * closing is what fixes payroll's inputs.
   */
  @Post(':year/:month/close')
  @RequirePermissions('presence-periods.close')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'year', example: 2026 })
  @ApiParam({ name: 'month', example: 8 })
  @ApiOperation({
    summary: 'Close a month — refused while any day still lacks a check-out',
  })
  async close(
    @Param('year', ParseIntPipe) year: number,
    @Param('month', ParseIntPipe) month: number,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<AttendancePeriodEntity> {
    return this.closeUC.execute(year, month, user.id);
  }
}
