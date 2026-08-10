import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import type {
  NonWorkingDayEntity,
  WorkPatternAssignmentWithDetails,
  WorkPatternEntity,
  WorkPatternWithDays,
} from '../domain/entities/work-pattern.entity.js';
import { AssignWorkPatternDto } from '../dto/request/assign-work-pattern.dto.js';
import { BulkNonWorkingDaysDto } from '../dto/request/bulk-non-working-days.dto.js';
import { CreateWorkPatternDto } from '../dto/request/create-work-pattern.dto.js';
import { NonWorkingDayQueryDto } from '../dto/request/non-working-day-query.dto.js';
import { ReplaceWorkPatternDaysDto } from '../dto/request/replace-work-pattern-days.dto.js';
import { UpdateNonWorkingDayDto } from '../dto/request/update-non-working-day.dto.js';
import { UpdateWorkPatternDto } from '../dto/request/update-work-pattern.dto.js';
import {
  AssignWorkPatternUseCase,
  BulkUpsertNonWorkingDaysUseCase,
  DeleteNonWorkingDayUseCase,
  GetNonWorkingDaysUseCase,
  GetWorkPatternAssignmentsUseCase,
  UpdateNonWorkingDayUseCase,
} from '../use-cases/manage-non-working-days.use-case.js';
import {
  CreateWorkPatternUseCase,
  DeleteWorkPatternUseCase,
  GetWorkPatternsUseCase,
  ReplaceWorkPatternDaysUseCase,
  UpdateWorkPatternUseCase,
} from '../use-cases/manage-work-pattern.use-case.js';

@ApiTags('Presence — Work Patterns')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('presence')
export class WorkPatternController {
  constructor(
    private readonly getPatterns: GetWorkPatternsUseCase,
    private readonly createPattern: CreateWorkPatternUseCase,
    private readonly updatePattern: UpdateWorkPatternUseCase,
    private readonly deletePattern: DeleteWorkPatternUseCase,
    private readonly replaceDays: ReplaceWorkPatternDaysUseCase,
    private readonly getAssignments: GetWorkPatternAssignmentsUseCase,
    private readonly assignPattern: AssignWorkPatternUseCase,
    private readonly getHolidays: GetNonWorkingDaysUseCase,
    private readonly bulkHolidays: BulkUpsertNonWorkingDaysUseCase,
    private readonly updateHoliday: UpdateNonWorkingDayUseCase,
    private readonly deleteHoliday: DeleteNonWorkingDayUseCase,
  ) {}

  @Get('work-patterns')
  @RequirePermissions('work-patterns.read')
  async listPatterns(): Promise<WorkPatternWithDays[]> {
    return this.getPatterns.execute();
  }

  @Post('work-patterns')
  @RequirePermissions('work-patterns.create')
  async create(@Body() dto: CreateWorkPatternDto): Promise<WorkPatternEntity> {
    return this.createPattern.execute(dto);
  }

  @Patch('work-patterns/:id')
  @RequirePermissions('work-patterns.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({
    summary:
      'Edit a pattern — closed periods keep the figures they were judged with',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkPatternDto,
  ): Promise<WorkPatternEntity> {
    return this.updatePattern.execute(id, dto);
  }

  @Delete('work-patterns/:id')
  @RequirePermissions('work-patterns.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<WorkPatternEntity> {
    return this.deletePattern.execute(id);
  }

  @Put('work-patterns/:id/days')
  @RequirePermissions('work-patterns.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Replace all seven weekdays atomically' })
  async putDays(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplaceWorkPatternDaysDto,
  ) {
    return this.replaceDays.execute(id, dto);
  }

  @Get('work-pattern-assignments')
  @RequirePermissions('work-patterns.read')
  async listAssignments(
    @Query('userId') userId?: string,
  ): Promise<WorkPatternAssignmentWithDetails[]> {
    return this.getAssignments.execute(userId);
  }

  @Post('work-pattern-assignments')
  @RequirePermissions('work-patterns.create')
  async assign(
    @Body() dto: AssignWorkPatternDto,
  ): Promise<WorkPatternAssignmentWithDetails> {
    return this.assignPattern.execute(dto);
  }

  @Get('non-working-days')
  @RequirePermissions('non-working-days.read')
  async listHolidays(
    @Query() query: NonWorkingDayQueryDto,
  ): Promise<NonWorkingDayEntity[]> {
    return this.getHolidays.execute(query);
  }

  /**
   * Takes explicit dates. The operator's browser reads the academic calendar,
   * previews them, and posts them here — nothing in this domain calls
   * `academic/` (research R9).
   */
  @Post('non-working-days/bulk')
  @RequirePermissions('non-working-days.create')
  @ApiOperation({ summary: 'Add holidays previewed by the operator' })
  async bulk(
    @Body() dto: BulkNonWorkingDaysDto,
  ): Promise<{ imported: number; skipped: number }> {
    return this.bulkHolidays.execute(dto);
  }

  @Patch('non-working-days/:id')
  @RequirePermissions('non-working-days.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  async renameHoliday(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNonWorkingDayDto,
  ): Promise<NonWorkingDayEntity> {
    return this.updateHoliday.execute(id, dto.name);
  }

  @Delete('non-working-days/:id')
  @RequirePermissions('non-working-days.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  async removeHoliday(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.deleteHoliday.execute(id);
  }
}
