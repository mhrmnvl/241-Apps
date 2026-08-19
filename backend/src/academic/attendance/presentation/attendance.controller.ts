import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
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

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import { CreateAttendanceDto } from '../dto/request/create-attendance.dto.js';
import { UpdateAttendanceDto } from '../dto/request/update-attendance.dto.js';
import { AttendanceQueryDto } from '../dto/request/attendance-query.dto.js';
import { BulkUpsertAttendanceDto } from '../dto/request/bulk-upsert-attendance.dto.js';
import { AttendanceRecapQueryDto } from '../dto/request/attendance-recap-query.dto.js';
import { AttendanceTrendQueryDto } from '../dto/request/attendance-trend-query.dto.js';
import { GetAttendancesUseCase } from '../use-cases/get-attendances.use-case.js';
import { GetMyAttendancesUseCase } from '../use-cases/get-my-attendances.use-case.js';
import { GetAttendanceByIdUseCase } from '../use-cases/get-attendance-by-id.use-case.js';
import { CreateAttendanceUseCase } from '../use-cases/create-attendance.use-case.js';
import { UpdateAttendanceUseCase } from '../use-cases/update-attendance.use-case.js';
import { DeleteAttendanceUseCase } from '../use-cases/delete-attendance.use-case.js';
import { BulkUpsertAttendanceUseCase } from '../use-cases/bulk-upsert-attendance.use-case.js';
import { GetAttendanceRecapUseCase } from '../use-cases/get-attendance-recap.use-case.js';
import { GetAttendanceTrendUseCase } from '../use-cases/get-attendance-trend.use-case.js';
import {
  AttendanceSuggestionResult,
  GetAttendanceSuggestionsUseCase,
} from '../use-cases/get-attendance-suggestions.use-case.js';
import { AttendanceSuggestionQueryDto } from '../dto/request/attendance-suggestion-query.dto.js';

@ApiTags('Attendances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendances')
export class AttendanceController {
  constructor(
    private readonly getAll: GetAttendancesUseCase,
    private readonly getMine: GetMyAttendancesUseCase,
    private readonly getById: GetAttendanceByIdUseCase,
    private readonly createUC: CreateAttendanceUseCase,
    private readonly updateUC: UpdateAttendanceUseCase,
    private readonly deleteUC: DeleteAttendanceUseCase,
    private readonly bulkUpsertUC: BulkUpsertAttendanceUseCase,
    private readonly recapUC: GetAttendanceRecapUseCase,
    private readonly trendUC: GetAttendanceTrendUseCase,
    private readonly suggestionsUC: GetAttendanceSuggestionsUseCase,
  ) {}

  /**
   * What the gate saw for this class today, as a suggestion.
   *
   * Declared before the bare `@Get()` so "suggestions" is never taken for a
   * list query. It writes nothing — the teacher's save still owns the record.
   */
  @Get('suggestions')
  @RequirePermissions('attendances.read')
  @ApiOperation({ summary: 'Gate pre-fill for a class, unconfirmed' })
  async suggestions(
    @Query() query: AttendanceSuggestionQueryDto,
  ): Promise<AttendanceSuggestionResult> {
    return this.suggestionsUC.execute(query);
  }

  @Get()
  @RequirePermissions('attendances.read')
  @ApiOperation({ summary: 'List attendances' })
  async findAll(@Query() q: AttendanceQueryDto) {
    return this.getAll.execute(q);
  }

  /**
   * Declared before `:id` so `me` is never parsed as a uuid.
   */
  @Get('me')
  @RequirePermissions('attendances.read-own')
  @ApiOperation({
    summary: 'Your own attendance — no student parameter exists',
  })
  async findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: AttendanceQueryDto,
  ) {
    return this.getMine.execute(q, user.id);
  }

  /**
   * Stays on `attendances.read`, and must. A recap describes a cohort — how a
   * class did — so answering one to a caller holding only `attendances.read-own`
   * would hand them a summary of other people without disclosing a single row
   * of theirs. A student's own figures come from their own rows, through
   * `GET me` above.
   *
   * If this ever looks like an oversight, it is not: adding the `-own` code
   * here reopens what this feature closed.
   */
  @Get('recap')
  @RequirePermissions('attendances.read')
  @ApiOperation({ summary: 'Get attendance recap per student' })
  async getRecap(@Query() q: AttendanceRecapQueryDto) {
    return this.recapUC.execute(q);
  }

  /** Cohort-shaped like `recap`, and management-only for the same reason. */
  @Get('recap/trend')
  @RequirePermissions('attendances.read')
  @ApiOperation({
    summary: 'Get monthly attendance percentage trend for a classroom',
  })
  async getTrend(@Query() q: AttendanceTrendQueryDto) {
    return this.trendUC.execute(q);
  }

  @Get(':id')
  @RequirePermissions('attendances.read')
  @ApiOperation({ summary: 'Get attendance by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('attendances.manage')
  @ApiOperation({ summary: 'Create attendance' })
  async create(@Body() dto: CreateAttendanceDto) {
    return this.createUC.execute(dto);
  }

  @Post('bulk')
  @RequirePermissions('attendances.manage')
  @ApiOperation({ summary: 'Bulk upsert attendances for a date' })
  async bulkUpsert(@Body() dto: BulkUpsertAttendanceDto) {
    return this.bulkUpsertUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('attendances.update')
  @ApiOperation({ summary: 'Update attendance' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAttendanceDto,
  ) {
    return this.updateUC.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('attendances.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete attendance' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.deleteUC.execute(id);
  }
}
