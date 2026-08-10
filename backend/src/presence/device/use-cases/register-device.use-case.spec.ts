import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DeviceTokenService } from '../../shared/services/device-token.service.js';
import { IDeviceRepository } from '../domain/interfaces/device-repository.interface.js';
import {
  RegisterDeviceUseCase,
  RotateDeviceTokenUseCase,
} from './register-device.use-case.js';

describe('RegisterDeviceUseCase', () => {
  let register: RegisterDeviceUseCase;
  let rotate: RotateDeviceTokenUseCase;
  const repository = {
    create: jest.fn(),
    findById: jest.fn(),
    rotateToken: jest.fn(),
  };
  const tokens = { issue: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterDeviceUseCase,
        RotateDeviceTokenUseCase,
        { provide: IDeviceRepository, useValue: repository },
        { provide: DeviceTokenService, useValue: tokens },
      ],
    }).compile();

    register = module.get(RegisterDeviceUseCase);
    rotate = module.get(RotateDeviceTokenUseCase);
    jest.clearAllMocks();
    tokens.issue.mockReturnValue({ token: 'plain-token', hash: 'hashed' });
    repository.create.mockResolvedValue({ id: 'device-1' });
    repository.findById.mockResolvedValue({ id: 'device-1' });
    repository.rotateToken.mockResolvedValue({ id: 'device-1' });
  });

  // The whole point of hashing: a database leak must not hand over a working
  // gate credential.
  it('stores only the hash, never the plaintext token', async () => {
    await register.execute({ name: 'Gerbang Utama' });

    const [input] = repository.create.mock.calls[0] as [
      Record<string, unknown>,
    ];
    expect(input.tokenHash).toBe('hashed');
    expect(JSON.stringify(input)).not.toContain('plain-token');
  });

  it('returns the plaintext token to the operator exactly once', async () => {
    const result = await register.execute({ name: 'Gerbang Utama' });

    expect(result.token).toBe('plain-token');
  });

  it('records when the token was issued', async () => {
    await register.execute({ name: 'Gerbang Utama' });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ tokenIssuedAt: expect.any(Date) }),
    );
  });

  it('normalises an absent location to null rather than undefined', async () => {
    await register.execute({ name: 'Gerbang Utama' });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({ location: null }),
    );
  });

  describe('rotation', () => {
    it('issues a fresh token and keeps the device', async () => {
      const result = await rotate.execute('device-1');

      expect(repository.rotateToken).toHaveBeenCalledWith('device-1', {
        tokenHash: 'hashed',
        tokenIssuedAt: expect.any(Date),
      });
      expect(result.token).toBe('plain-token');
    });

    it('refuses to rotate an unknown device', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(rotate.execute('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.rotateToken).not.toHaveBeenCalled();
    });
  });
});
