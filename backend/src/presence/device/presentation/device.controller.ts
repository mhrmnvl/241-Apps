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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';
import { DeviceEntity } from '../domain/entities/device.entity.js';
import { DeviceQueryDto } from '../dto/request/device-query.dto.js';
import { RegisterDeviceDto } from '../dto/request/register-device.dto.js';
import { UpdateDeviceDto } from '../dto/request/update-device.dto.js';
import {
  DeleteDeviceUseCase,
  GetDevicesUseCase,
  UpdateDeviceUseCase,
} from '../use-cases/get-devices.use-case.js';
import {
  DeviceWithToken,
  RegisterDeviceUseCase,
  RotateDeviceTokenUseCase,
} from '../use-cases/register-device.use-case.js';

@ApiTags('Presence — Gate Devices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('presence/devices')
export class DeviceController {
  constructor(
    private readonly getAll: GetDevicesUseCase,
    private readonly registerUC: RegisterDeviceUseCase,
    private readonly rotateUC: RotateDeviceTokenUseCase,
    private readonly updateUC: UpdateDeviceUseCase,
    private readonly deleteUC: DeleteDeviceUseCase,
  ) {}

  @Get()
  @RequirePermissions('presence-devices.read')
  @ApiOperation({ summary: 'List gate devices with their last-seen time' })
  async list(
    @Query() query: DeviceQueryDto,
  ): Promise<PaginatedResponse<DeviceEntity>> {
    return this.getAll.execute(query);
  }

  @Post()
  @RequirePermissions('presence-devices.create')
  @ApiOperation({ summary: 'Register a gate — the token is shown once' })
  async register(@Body() dto: RegisterDeviceDto): Promise<DeviceWithToken> {
    return this.registerUC.execute(dto);
  }

  @Post(':id/rotate-token')
  @RequirePermissions('presence-devices.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Issue a new token — the old one stops working' })
  async rotate(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DeviceWithToken> {
    return this.rotateUC.execute(id);
  }

  @Patch(':id')
  @RequirePermissions('presence-devices.update')
  @ApiParam({ name: 'id', format: 'uuid' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeviceDto,
  ): Promise<DeviceEntity> {
    return this.updateUC.execute(id, dto);
  }

  @Delete(':id')
  @RequirePermissions('presence-devices.delete')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOperation({ summary: 'Retire a gate — its scan history is kept' })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<DeviceEntity> {
    return this.deleteUC.execute(id);
  }
}
