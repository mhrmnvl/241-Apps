import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IDeviceRepository } from '../../device/domain/interfaces/device-repository.interface.js';
import { PRESENCE_DEVICE_REQUEST_KEY } from '../constants/presence.constants.js';
import { DeviceTokenService } from '../services/device-token.service.js';
import { DeviceGuard } from './device.guard.js';

const DEVICE = { id: 'device-1', name: 'Gerbang Utama', isActive: true };

function contextWith(authorization?: string) {
  const request: Record<string, unknown> = { headers: { authorization } };
  return {
    context: {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext,
    request,
  };
}

describe('DeviceGuard', () => {
  let guard: DeviceGuard;
  let tokens: DeviceTokenService;
  const repository = { findByTokenHash: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeviceGuard,
        DeviceTokenService,
        { provide: IDeviceRepository, useValue: repository },
      ],
    }).compile();

    guard = module.get(DeviceGuard);
    tokens = module.get(DeviceTokenService);
    jest.clearAllMocks();
    repository.findByTokenHash.mockResolvedValue(DEVICE);
  });

  it('admits a registered, active device and attaches it to the request', async () => {
    const { context, request } = contextWith('Bearer gate-token');

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request[PRESENCE_DEVICE_REQUEST_KEY]).toEqual(DEVICE);
  });

  // The plaintext must never be what is stored or compared against directly.
  it('looks the device up by the token hash, never the token', async () => {
    const { context } = contextWith('Bearer gate-token');

    await guard.canActivate(context);

    expect(repository.findByTokenHash).toHaveBeenCalledWith(
      tokens.hash('gate-token'),
    );
    expect(repository.findByTokenHash).not.toHaveBeenCalledWith('gate-token');
  });

  it('accepts a lowercase bearer scheme', async () => {
    const { context } = contextWith('bearer gate-token');
    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  describe('refusals', () => {
    it('refuses a request with no Authorization header', async () => {
      const { context } = contextWith(undefined);
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('refuses a non-bearer scheme', async () => {
      const { context } = contextWith('Basic gate-token');
      await expect(guard.canActivate(context)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('refuses an unrecognised token', async () => {
      repository.findByTokenHash.mockResolvedValue(null);
      const { context } = contextWith('Bearer wrong');

      await expect(guard.canActivate(context)).rejects.toThrow(
        /not recognised/,
      );
    });

    // Deactivation must take effect immediately — that is the whole point of
    // being able to revoke a stolen tablet.
    it('refuses a deactivated device even with a valid token', async () => {
      repository.findByTokenHash.mockResolvedValue({
        ...DEVICE,
        isActive: false,
      });
      const { context, request } = contextWith('Bearer gate-token');

      await expect(guard.canActivate(context)).rejects.toThrow(/deactivated/);
      expect(request[PRESENCE_DEVICE_REQUEST_KEY]).toBeUndefined();
    });
  });
});
