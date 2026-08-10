import { Module } from '@nestjs/common';
import { CredentialModule } from '../credential/credential.module.js';
import { DailyRecordModule } from '../daily-record/daily-record.module.js';
import { DeviceModule } from '../device/device.module.js';
import { DeviceGuard } from '../shared/guards/device.guard.js';
import { PresenceSharedModule } from '../shared/presence-shared.module.js';
import { IScanRepository } from './domain/interfaces/scan-repository.interface.js';
import { PrismaScanRepository } from './infrastructure/persistence/prisma-scan.repository.js';
import { ScanController } from './presentation/scan.controller.js';
import {
  GetClockAnchorUseCase,
  GetScansUseCase,
} from './use-cases/get-scans.use-case.js';
import { RecordScanBatchUseCase } from './use-cases/record-scan-batch.use-case.js';
import { RecordScanUseCase } from './use-cases/record-scan.use-case.js';

/**
 * Provides `DeviceGuard` because this is the only module whose routes use it.
 * The guard lives in `shared/` but is wired here so nothing else inherits a
 * dependency on the device module.
 */
@Module({
  imports: [
    PresenceSharedModule,
    CredentialModule,
    DailyRecordModule,
    DeviceModule,
  ],
  controllers: [ScanController],
  providers: [
    { provide: IScanRepository, useClass: PrismaScanRepository },
    DeviceGuard,
    RecordScanUseCase,
    RecordScanBatchUseCase,
    GetScansUseCase,
    GetClockAnchorUseCase,
  ],
})
export class ScanModule {}
