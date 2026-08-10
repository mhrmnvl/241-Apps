import {
  Body,
  Controller,
  Get,
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
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';
import { DailyPresenceEntity } from '../domain/entities/daily-presence.entity.js';
import type {
  DailyPresenceWithDetails,
  PresenceRecap,
} from '../domain/interfaces/daily-presence-recap.interface.js';
import { CreateDailyPresenceDto } from '../dto/request/create-daily-presence.dto.js';
import { DailyPresenceQueryDto } from '../dto/request/daily-presence-query.dto.js';
import { MyPresenceQueryDto } from '../dto/request/my-presence-query.dto.js';
import { PresenceRecapQueryDto } from '../dto/request/presence-recap-query.dto.js';
import { UpdateDailyPresenceDto } from '../dto/request/update-daily-presence.dto.js';
import { CreateDailyPresenceUseCase } from '../use-cases/create-daily-presence.use-case.js';
import {
  DailyPresenceDetail,
  GetDailyPresenceByIdUseCase,
  GetDailyPresencesUseCase,
  GetMyDailyPresencesUseCase,
} from '../use-cases/get-daily-presences.use-case.js';
import {
  ExportPresenceRecapUseCase,
  GetPresenceRecapUseCase,
  RecapExportRow,
} from '../use-cases/get-presence-recap.use-case.js';
import { UpdateDailyPresenceUseCase } from '../use-cases/update-daily-presence.use-case.js';

@ApiTags('Presence — Daily Records')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('presence/daily-records')
export class DailyRecordController {
  constructor(
    private readonly getAll: GetDailyPresencesUseCase,
    private readonly getById: GetDailyPresenceByIdUseCase,
    private readonly getMine: GetMyDailyPresencesUseCase,
    private readonly getRecap: GetPresenceRecapUseCase,
    private readonly exportRecap: ExportPresenceRecapUseCase,
    private readonly createUC: CreateDailyPresenceUseCase,
    private readonly updateUC: UpdateDailyPresenceUseCase,
  ) {}

  @Get()
  @RequirePermissions('presence-records.read')
  @ApiOperation({ summary: "A day's attendance for everyone" })
  async list(
    @Query() query: DailyPresenceQueryDto,
  ): Promise<PaginatedResponse<DailyPresenceWithDetails>> {
    return this.getAll.execute({ ...query, date: new Date(query.date) });
  }

  /**
   * Declared before `:id` so "me" and "recap" are not parsed as uuids.
   *
   * There is no `userId` parameter by design — this route cannot be pointed at
   * another person however it is called (FR-061).
   */
  @Get('me')
  @RequirePermissions('presence-records.read-own')
  @ApiOperation({ summary: 'Your own attendance for a month' })
  async mine(
    @Query() query: MyPresenceQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const now = new Date();
    return this.getMine.execute(
      user.id,
      query.year ?? now.getUTCFullYear(),
      query.month ?? now.getUTCMonth() + 1,
    );
  }

  @Get('recap')
  @RequirePermissions('presence-records.read')
  @ApiOperation({ summary: 'Monthly recap per person' })
  async recap(@Query() query: PresenceRecapQueryDto): Promise<PresenceRecap> {
    return this.getRecap.execute(query);
  }

  @Get('recap/export')
  @RequirePermissions('presence-records.read')
  @ApiOperation({ summary: 'The same figures as the recap, for a spreadsheet' })
  async export(
    @Query() query: PresenceRecapQueryDto,
  ): Promise<RecapExportRow[]> {
    return this.exportRecap.execute(query);
  }

  @Get(':id')
  @RequirePermissions('presence-records.read')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'One day, with its full correction trail' })
  async detail(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DailyPresenceDetail> {
    return this.getById.execute(id);
  }

  @Post()
  @RequirePermissions('presence-records.create')
  @ApiOperation({
    summary: 'Record a day by hand for someone who never scanned',
  })
  async create(
    @Body() dto: CreateDailyPresenceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DailyPresenceEntity> {
    return this.createUC.execute(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('presence-records.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({
    summary:
      'Correct a day — a reason is required and you cannot edit your own',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDailyPresenceDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<DailyPresenceEntity> {
    return this.updateUC.execute(id, dto, user.id);
  }
}
