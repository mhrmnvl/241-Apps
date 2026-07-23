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

import {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  AttendanceQueryDto,
  BulkUpsertAttendanceDto,
  AttendanceRecapQueryDto,
  AttendanceTrendQueryDto,
} from '../dto/request/attendance.dto.js';
import {
  GetAttendancesUseCase,
  GetAttendanceByIdUseCase,
  CreateAttendanceUseCase,
  UpdateAttendanceUseCase,
  DeleteAttendanceUseCase,
  BulkUpsertAttendanceUseCase,
  GetAttendanceRecapUseCase,
  GetAttendanceTrendUseCase,
} from '../use-cases/attendance.use-case.js';

@ApiTags('Attendances')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendances')
export class AttendanceController {
  constructor(
    private readonly getAll: GetAttendancesUseCase,
    private readonly getById: GetAttendanceByIdUseCase,
    private readonly createUC: CreateAttendanceUseCase,
    private readonly updateUC: UpdateAttendanceUseCase,
    private readonly deleteUC: DeleteAttendanceUseCase,
    private readonly bulkUpsertUC: BulkUpsertAttendanceUseCase,
    private readonly recapUC: GetAttendanceRecapUseCase,
    private readonly trendUC: GetAttendanceTrendUseCase,
  ) {}

  @Get()
  @RequirePermissions('attendances.read')
  @ApiOperation({ summary: 'List attendances' })
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: AttendanceQueryDto,
  ) {
    return this.getAll.execute(q);
  }

  @Get('recap')
  @RequirePermissions('attendances.read')
  @ApiOperation({ summary: 'Get attendance recap per student' })
  async getRecap(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: AttendanceRecapQueryDto,
  ) {
    return this.recapUC.execute(q);
  }

  @Get('recap/trend')
  @RequirePermissions('attendances.read')
  @ApiOperation({
    summary: 'Get monthly attendance percentage trend for a classroom',
  })
  async getTrend(
    @CurrentUser() user: AuthenticatedUser,
    @Query() q: AttendanceTrendQueryDto,
  ) {
    return this.trendUC.execute(q);
  }

  @Get(':id')
  @RequirePermissions('attendances.read')
  @ApiOperation({ summary: 'Get attendance by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('attendances.manage')
  @ApiOperation({ summary: 'Create attendance' })
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateAttendanceDto,
  ) {
    return this.createUC.execute(dto);
  }

  @Post('bulk')
  @RequirePermissions('attendances.manage')
  @ApiOperation({ summary: 'Bulk upsert attendances for a date' })
  async bulkUpsert(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BulkUpsertAttendanceDto,
  ) {
    return this.bulkUpsertUC.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('attendances.update')
  @ApiOperation({ summary: 'Update attendance' })
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @CurrentUser() user: AuthenticatedUser,
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
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.deleteUC.execute(id);
  }
}
