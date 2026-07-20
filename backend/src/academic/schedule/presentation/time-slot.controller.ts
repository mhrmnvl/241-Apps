import { RequirePermissions } from '../../../platform/access-control/permissions/decorators/require-permissions.decorator.js';
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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { CurrentUser } from '../../../core/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

import {
  TimeSlotResponseDto,
  TimeSlotTypeResponseDto,
} from '../dto/response/time-slot-response.dto.js';
import { CreateTimeSlotDto } from '../dto/request/create-time-slot.dto.js';
import { UpdateTimeSlotDto } from '../dto/request/update-time-slot.dto.js';
import { CreateTimeSlotUseCase } from '../use-cases/create-time-slot.use-case.js';
import { DeleteTimeSlotUseCase } from '../use-cases/delete-time-slot.use-case.js';
import { GetTimeSlotByIdUseCase } from '../use-cases/get-time-slot-by-id.use-case.js';
import { GetTimeSlotsUseCase } from '../use-cases/get-time-slots.use-case.js';
import { GetTimeSlotTypesUseCase } from '../use-cases/get-time-slot-types.use-case.js';
import { UpdateTimeSlotUseCase } from '../use-cases/update-time-slot.use-case.js';

@ApiTags('Time-Slots')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('time-slots')
export class TimeSlotController {
  constructor(
    private readonly getTimeSlotsService: GetTimeSlotsUseCase,
    private readonly getTimeSlotTypesService: GetTimeSlotTypesUseCase,
    private readonly getTimeSlotByIdService: GetTimeSlotByIdUseCase,
    private readonly createTimeSlotService: CreateTimeSlotUseCase,
    private readonly updateTimeSlotService: UpdateTimeSlotUseCase,
    private readonly deleteTimeSlotService: DeleteTimeSlotUseCase,
  ) {}

  @Get()
  @RequirePermissions('time-slots.read')
  @ApiOperation({ summary: 'List all time slots (ordered by slot order)' })
  @ApiResponse({ status: 200, type: [TimeSlotResponseDto] })
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.getTimeSlotsService.execute();
  }

  @Get('types')
  @RequirePermissions('time-slots.read')
  @ApiOperation({ summary: 'List all time slot types' })
  @ApiResponse({ status: 200, type: [TimeSlotTypeResponseDto] })
  async findAllTypes() {
    return this.getTimeSlotTypesService.execute();
  }

  @Get(':id')
  @RequirePermissions('time-slots.read')
  @ApiOperation({ summary: 'Get a time slot by ID' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: TimeSlotResponseDto })
  @ApiResponse({ status: 404, description: 'TimeSlot not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.getTimeSlotByIdService.execute(id);
  }

  @Post()
  @RequirePermissions('time-slots.create')
  @ApiOperation({ summary: 'Create a new time slot' })
  @ApiResponse({ status: 201, type: TimeSlotResponseDto })
  async create(
    @Body() dto: CreateTimeSlotDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.createTimeSlotService.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('time-slots.update')
  @ApiOperation({ summary: 'Update a time slot' })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: TimeSlotResponseDto })
  @ApiResponse({ status: 404, description: 'TimeSlot not found' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTimeSlotDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.updateTimeSlotService.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('time-slots.delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a time slot (only if not in use by lessons)',
  })
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'TimeSlot deleted' })
  @ApiResponse({ status: 404, description: 'TimeSlot not found' })
  @ApiResponse({ status: 409, description: 'TimeSlot still in use' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.deleteTimeSlotService.execute(id);
  }
}
