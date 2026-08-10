import { applyDecorators, SetMetadata } from '@nestjs/common';
import { Public } from '../../../core/decorators/public.decorator.js';

export const IS_DEVICE_AUTH_KEY = 'isDeviceAuth';

/**
 * Marks a route as authenticated by a gate device rather than by a person.
 *
 * The kiosk is an unattended appliance at a school entrance. Logging it in as a
 * staff member would attribute every scan to whoever logged in that morning and
 * leave a full-privilege session sitting where anyone walking past can reach it
 * (research R7).
 *
 * `Public()` is what takes the route out of the global `JwtAuthGuard` — the same
 * mechanism `@PortalPublic()` uses. It does **not** make the route open: the
 * controller pairs this with `@UseGuards(DeviceGuard)`, which requires a valid
 * device token. Only scan ingest and the clock anchor carry it, so a stolen
 * device can create scan noise but cannot read one person's history.
 */
export const DeviceAuth = () =>
  applyDecorators(Public(), SetMetadata(IS_DEVICE_AUTH_KEY, true));
