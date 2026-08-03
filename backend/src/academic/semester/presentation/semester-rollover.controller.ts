import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';
import { RolloverSemesterDto } from '../dto/request/rollover-semester.dto.js';
import { RolloverSummaryDto } from '../dto/response/rollover-summary.dto.js';
import { RolloverSemesterUseCase } from '../use-cases/rollover-semester.use-case.js';

@ApiTags('Semesters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('semesters/rollover')
export class SemesterRolloverController {
  constructor(
    private readonly rolloverSemesterService: RolloverSemesterUseCase,
  ) {}

  @Post()
  @RequirePermissions('semesters.create')
  @ApiOperation({
    summary:
      'Rollover semester data (classrooms, enrollments, etc.) from source to target semester',
  })
  @ApiResponse({
    status: 200,
    description: 'Rollover summary with created/skipped counts',
  })
  @ApiResponse({ status: 400, description: 'Source and target must differ' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Semester not found' })
  async rollover(
    @CurrentUser() _user: AuthenticatedUser,
    @Body() dto: RolloverSemesterDto,
  ): Promise<RolloverSummaryDto> {
    return this.rolloverSemesterService.execute(dto);
  }
}
