import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
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
import type {
  LeaveBalanceRow,
  LeaveRequestWithDetails,
} from '../domain/entities/leave.entity.js';
import { DecideLeaveRequestDto } from '../dto/request/decide-leave-request.dto.js';
import { LeaveRequestQueryDto } from '../dto/request/leave-request-query.dto.js';
import { SubmitLeaveRequestDto } from '../dto/request/submit-leave-request.dto.js';
import { RecordStudentAbsenceDto } from '../dto/request/record-student-absence.dto.js';
import {
  ApproveLeaveRequestUseCase,
  RejectLeaveRequestUseCase,
  WithdrawLeaveRequestUseCase,
} from '../use-cases/decide-leave-request.use-case.js';
import {
  GetLeaveBalancesUseCase,
  GetLeaveRequestsUseCase,
} from '../use-cases/manage-leave-types.use-case.js';
import { RecordStudentExcusedAbsenceUseCase } from '../use-cases/record-student-excused-absence.use-case.js';
import { SubmitLeaveRequestUseCase } from '../use-cases/submit-leave-request.use-case.js';

@ApiTags('Presence — Leave')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('presence')
export class LeaveController {
  constructor(
    private readonly getRequests: GetLeaveRequestsUseCase,
    private readonly submitUC: SubmitLeaveRequestUseCase,
    private readonly approveUC: ApproveLeaveRequestUseCase,
    private readonly rejectUC: RejectLeaveRequestUseCase,
    private readonly withdrawUC: WithdrawLeaveRequestUseCase,
    private readonly getBalances: GetLeaveBalancesUseCase,
    private readonly studentAbsenceUC: RecordStudentExcusedAbsenceUseCase,
  ) {}

  // --- Requests ---

  @Get('leave-requests')
  @RequirePermissions('leave-requests.read')
  async listRequests(
    @Query() query: LeaveRequestQueryDto,
  ): Promise<LeaveRequestWithDetails[]> {
    return this.getRequests.execute(query);
  }

  /** Declared before `:id` routes so "me" is never parsed as a uuid. */
  @Get('leave-requests/me')
  @RequirePermissions('leave-requests.read-own')
  @ApiOperation({ summary: 'Your own requests — no user parameter exists' })
  async myRequests(
    @Query() query: LeaveRequestQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LeaveRequestWithDetails[]> {
    return this.getRequests.execute({ ...query, requesterId: user.id });
  }

  @Post('leave-requests')
  @RequirePermissions('leave-requests.create')
  @ApiOperation({ summary: 'Submit leave — only working days consume quota' })
  async submit(
    @Body() dto: SubmitLeaveRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LeaveRequestWithDetails> {
    return this.submitUC.execute(dto, user.id);
  }

  @Post('leave-requests/:id/approve')
  @RequirePermissions('leave-requests.approve')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({
    summary: 'Approve — refused for your own request, or over quota',
  })
  async approve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LeaveRequestWithDetails> {
    return this.approveUC.execute(id, user.id);
  }

  @Post('leave-requests/:id/reject')
  @RequirePermissions('leave-requests.approve')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', format: 'uuid' })
  async reject(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: DecideLeaveRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LeaveRequestWithDetails> {
    return this.rejectUC.execute(id, dto, user.id);
  }

  @Post('leave-requests/:id/withdraw')
  @RequirePermissions('leave-requests.create')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({
    summary: 'Withdraw your own pending request — consumes no quota',
  })
  async withdraw(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LeaveRequestWithDetails> {
    return this.withdrawUC.execute(id, user.id);
  }

  /**
   * The wali kelas path for a parent's sick note. Recorded and approved in one
   * step — the teacher is the decision, and asking them to approve their own
   * filing would be ceremony (FR-035).
   */
  @Post('student-absences')
  @RequirePermissions('attendances.manage')
  @ApiOperation({ summary: 'Record a student excused absence' })
  async recordStudentAbsence(
    @Body() dto: RecordStudentAbsenceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LeaveRequestWithDetails> {
    return this.studentAbsenceUC.execute(dto, user.id);
  }

  // --- Balances ---

  @Get('leave-balances/me')
  @RequirePermissions('leave-requests.read-own')
  async myBalances(
    @Query('year') year: string | undefined,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<LeaveBalanceRow[]> {
    return this.getBalances.execute(
      user.id,
      year ? Number(year) : new Date().getUTCFullYear(),
    );
  }

  @Get('leave-balances/:userId')
  @RequirePermissions('leave-requests.read')
  @ApiParam({ name: 'userId', format: 'uuid' })
  async balancesFor(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('year') year?: string,
  ): Promise<LeaveBalanceRow[]> {
    return this.getBalances.execute(
      userId,
      year ? Number(year) : new Date().getUTCFullYear(),
    );
  }
}
