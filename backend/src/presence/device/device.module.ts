import { Module } from '@nestjs/common';
import { PresenceSharedModule } from '../shared/presence-shared.module.js';
import { IDeviceRepository } from './domain/interfaces/device-repository.interface.js';
import { PrismaDeviceRepository } from './infrastructure/persistence/prisma-device.repository.js';
import { DeviceController } from './presentation/device.controller.js';
import {
  DeleteDeviceUseCase,
  GetDevicesUseCase,
  UpdateDeviceUseCase,
} from './use-cases/get-devices.use-case.js';
import {
  RegisterDeviceUseCase,
  RotateDeviceTokenUseCase,
} from './use-cases/register-device.use-case.js';

/**
 * Exports the port for `DeviceGuard`, which `ScanModule` provides — the guard
 * lives in `shared/` but is only ever wired where it is used.
 */
@Module({
  imports: [PresenceSharedModule],
  controllers: [DeviceController],
  providers: [
    { provide: IDeviceRepository, useClass: PrismaDeviceRepository },
    GetDevicesUseCase,
    RegisterDeviceUseCase,
    RotateDeviceTokenUseCase,
    UpdateDeviceUseCase,
    DeleteDeviceUseCase,
  ],
  exports: [IDeviceRepository],
})
export class DeviceModule {}
