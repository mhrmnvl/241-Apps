import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
  SalaryAssignmentEntity,
  SalaryAssignmentWithComponent,
} from '../domain/entities/salary-assignment.entity.js';
import { CreateSalaryAssignmentDto } from '../dto/request/create-salary-assignment.dto.js';
import {
  CreateSalaryAssignmentUseCase,
  DeleteSalaryAssignmentUseCase,
  GetSalaryAssignmentsUseCase,
} from '../use-cases/manage-salary-assignment.use-case.js';

/**
 * Guarded by `payroll-salaries.*`, deliberately **not** `payroll-runs.*`
 * (FR-043): the person who calculates the month must not be the one who decides
 * what anybody is paid, themselves included.
 */
@ApiTags('Payroll — Salary Assignments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payroll/assignments')
export class SalaryAssignmentController {
  constructor(
    private readonly getAll: GetSalaryAssignmentsUseCase,
    private readonly createUC: CreateSalaryAssignmentUseCase,
    private readonly deleteUC: DeleteSalaryAssignmentUseCase,
  ) {}

  @Get()
  @RequirePermissions('payroll-salaries.read')
  async list(
    @Query('userId') userId?: string,
  ): Promise<SalaryAssignmentWithComponent[]> {
    return this.getAll.execute(userId);
  }

  @Get('user/:userId')
  @RequirePermissions('payroll-salaries.read')
  @ApiParam({ name: 'userId', format: 'uuid' })
  async forUser(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<SalaryAssignmentWithComponent[]> {
    return this.getAll.execute(userId);
  }

  @Post()
  @RequirePermissions('payroll-salaries.update')
  @ApiOperation({
    summary:
      'Set a salary — supersedes rather than overwriting, so an earlier run reproduces',
  })
  async create(
    @Body() dto: CreateSalaryAssignmentDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<SalaryAssignmentWithComponent> {
    return this.createUC.execute(dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('payroll-salaries.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SalaryAssignmentEntity> {
    return this.deleteUC.execute(id);
  }
}
