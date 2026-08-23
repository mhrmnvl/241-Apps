import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import type { LeaveTypeEntity } from '../domain/entities/leave.entity.js';
import { CreateLeaveTypeDto } from '../dto/request/create-leave-type.dto.js';
import { UpdateLeaveTypeDto } from '../dto/request/update-leave-type.dto.js';
import { LeaveTypeResponseDto } from '../dto/response/leave-type-response.dto.js';
import {
  CreateLeaveTypeUseCase,
  DeleteLeaveTypeUseCase,
  GetLeaveTypesUseCase,
  UpdateLeaveTypeUseCase,
} from '../use-cases/manage-leave-types.use-case.js';

/**
 * The school's own list of leave kinds — reference data with its own
 * permissions, separated from the request lifecycle it used to share a
 * controller with.
 */
@ApiTags('Presence — Leave Types')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('presence/leave-types')
export class LeaveTypeController {
  constructor(
    private readonly getTypes: GetLeaveTypesUseCase,
    private readonly createType: CreateLeaveTypeUseCase,
    private readonly updateType: UpdateLeaveTypeUseCase,
    private readonly deleteType: DeleteLeaveTypeUseCase,
  ) {}

  @Get()
  @RequirePermissions('leave-types.read')
  @ApiResponse({ status: 200, type: [LeaveTypeResponseDto] })
  async list(
    @Query('includeInactive') includeInactive?: string,
  ): Promise<LeaveTypeEntity[]> {
    return this.getTypes.execute(includeInactive === 'true');
  }

  @Post()
  @RequirePermissions('leave-types.create')
  @ApiResponse({ status: 201, type: LeaveTypeResponseDto })
  async add(@Body() dto: CreateLeaveTypeDto): Promise<LeaveTypeEntity> {
    return this.createType.execute(dto);
  }

  @Patch(':id')
  @RequirePermissions('leave-types.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: LeaveTypeResponseDto })
  async edit(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeaveTypeDto,
  ): Promise<LeaveTypeEntity> {
    return this.updateType.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('leave-types.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiResponse({ status: 200, type: LeaveTypeResponseDto })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<LeaveTypeEntity> {
    return this.deleteType.execute(id);
  }
}
