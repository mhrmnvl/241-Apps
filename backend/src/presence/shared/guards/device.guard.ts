import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { DeviceAuthContext } from '../../device/domain/entities/device.entity.js';
import { IDeviceRepository } from '../../device/domain/interfaces/device-repository.interface.js';
import { PRESENCE_DEVICE_REQUEST_KEY } from '../constants/presence.constants.js';
import { DeviceTokenService } from '../services/device-token.service.js';

interface DeviceRequest {
  headers: Record<string, string | string[] | undefined>;
  [PRESENCE_DEVICE_REQUEST_KEY]?: DeviceAuthContext;
}

function bearerToken(request: DeviceRequest): string | null {
  const header = request.headers.authorization;
  if (typeof header !== 'string') return null;

  const [scheme, value] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !value) return null;

  return value;
}

/**
 * Authenticates a gate terminal by its token.
 *
 * Paired with `@DeviceAuth()`, which takes the route out of `JwtAuthGuard`. A
 * route carrying the decorator without this guard would be genuinely public, so
 * the two always appear together — `scan.controller.ts` is the only place
 * either is used.
 *
 * Lookup is by hash, so the plaintext token exists only on the device.
 */
@Injectable()
export class DeviceGuard implements CanActivate {
  constructor(
    private readonly deviceRepository: IDeviceRepository,
    private readonly deviceTokens: DeviceTokenService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<DeviceRequest>();
    const token = bearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Device token missing');
    }

    const device = await this.deviceRepository.findByTokenHash(
      this.deviceTokens.hash(token),
    );

    if (!device) {
      throw new UnauthorizedException('Device token not recognised');
    }

    if (!device.isActive) {
      throw new UnauthorizedException('Device is deactivated');
    }

    request[PRESENCE_DEVICE_REQUEST_KEY] = device;
    return true;
  }
}
