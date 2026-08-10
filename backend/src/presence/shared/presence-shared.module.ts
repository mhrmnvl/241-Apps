import { Module } from '@nestjs/common';
import { DeviceTokenService } from './services/device-token.service.js';
import { ServerClockService } from './services/server-clock.service.js';

/**
 * The two stateless services the presence domain shares.
 *
 * `DeviceGuard` is deliberately **not** provided here even though it lives in
 * `shared/`: it depends on `IDeviceRepository`, and providing it at this level
 * would make every consumer of this module depend on the device module.
 * `ScanModule` — the only place the guard is used — provides it instead.
 */
@Module({
  providers: [ServerClockService, DeviceTokenService],
  exports: [ServerClockService, DeviceTokenService],
})
export class PresenceSharedModule {}
