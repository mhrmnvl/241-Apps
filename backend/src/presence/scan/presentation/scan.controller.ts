import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RequirePermissions } from '../../../platform/access-control/permission/decorators/require-permissions.decorator.js';
import { JwtAuthGuard } from '../../../platform/auth/index.js';
import { PaginatedResponse } from '../../../shared/domain/interfaces/repository.interface.js';
import { PRESENCE_DEVICE_REQUEST_KEY } from '../../shared/constants/presence.constants.js';
import { DeviceAuth } from '../../shared/decorators/device-auth.decorator.js';
import { DeviceGuard } from '../../shared/guards/device.guard.js';
import type { ClockAnchor } from '../../shared/services/server-clock.service.js';
import { BatchScanResult, ScanResult } from '../domain/entities/scan.entity.js';
import { ScanWithDevice } from '../domain/interfaces/scan-repository.interface.js';
import { RecordScanBatchDto } from '../dto/request/record-scan-batch.dto.js';
import { RecordScanDto } from '../dto/request/record-scan.dto.js';
import { ScanQueryDto } from '../dto/request/scan-query.dto.js';
import {
  GetClockAnchorUseCase,
  GetScansUseCase,
} from '../use-cases/get-scans.use-case.js';
import { RecordScanBatchUseCase } from '../use-cases/record-scan-batch.use-case.js';
import { RecordScanUseCase } from '../use-cases/record-scan.use-case.js';

interface DeviceRequest {
  [PRESENCE_DEVICE_REQUEST_KEY]: { id: string };
}

@ApiTags('Presence — Scans')
@Controller('presence/scans')
export class ScanController {
  constructor(
    private readonly recordScan: RecordScanUseCase,
    private readonly recordBatch: RecordScanBatchUseCase,
    private readonly getAnchor: GetClockAnchorUseCase,
    private readonly getAll: GetScansUseCase,
  ) {}

  /**
   * A rejection returns 201 with an outcome, never an HTTP error. The kiosk has
   * to tell "this card is invalid" apart from "the network failed" — conflating
   * them makes the offline queue retry a revoked card forever.
   */
  @Post()
  @DeviceAuth()
  @UseGuards(DeviceGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record one scan from a gate device' })
  async scan(
    @Req() request: DeviceRequest,
    @Body() dto: RecordScanDto,
  ): Promise<ScanResult> {
    return this.recordScan.execute(
      request[PRESENCE_DEVICE_REQUEST_KEY].id,
      dto,
    );
  }

  @Post('batch')
  @DeviceAuth()
  @UseGuards(DeviceGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Flush scans queued while the device was offline' })
  async batch(
    @Req() request: DeviceRequest,
    @Body() dto: RecordScanBatchDto,
  ): Promise<BatchScanResult[]> {
    return this.recordBatch.execute(
      request[PRESENCE_DEVICE_REQUEST_KEY].id,
      dto,
    );
  }

  @Get('clock')
  @DeviceAuth()
  @UseGuards(DeviceGuard)
  @ApiOperation({ summary: 'The anchor a device pins its monotonic clock to' })
  clock(): ClockAnchor {
    return this.getAnchor.execute();
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @RequirePermissions('presence-scans.read')
  @ApiOperation({ summary: 'The scan log, including rejected attempts' })
  async list(
    @Query() query: ScanQueryDto,
  ): Promise<PaginatedResponse<ScanWithDevice>> {
    return this.getAll.execute(query);
  }
}
