import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IDeviceRepository } from '../domain/interfaces/device-repository.interface.js';
import {
  DeleteDeviceUseCase,
  GetDevicesUseCase,
  UpdateDeviceUseCase,
} from './get-devices.use-case.js';

const DEVICE = {
  id: 'device-1',
  name: 'Gerbang Utama',
  location: 'Depan',
  isActive: true,
  lastSeenAt: new Date('2026-08-10T07:00:00.000Z'),
};

describe('device read and lifecycle use cases', () => {
  let list: GetDevicesUseCase;
  let update: UpdateDeviceUseCase;
  let remove: DeleteDeviceUseCase;
  const repository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetDevicesUseCase,
        UpdateDeviceUseCase,
        DeleteDeviceUseCase,
        { provide: IDeviceRepository, useValue: repository },
      ],
    }).compile();

    list = module.get(GetDevicesUseCase);
    update = module.get(UpdateDeviceUseCase);
    remove = module.get(DeleteDeviceUseCase);
    jest.clearAllMocks();
    repository.findAll.mockResolvedValue({
      data: [DEVICE],
      total: 1,
      page: 1,
      limit: 10,
    });
    repository.findById.mockResolvedValue(DEVICE);
  });

  // How an outage becomes visible instead of inferred from missing attendance.
  it('exposes lastSeenAt on the list', async () => {
    const result = await list.execute({});

    expect(result.data[0].lastSeenAt).toEqual(DEVICE.lastSeenAt);
  });

  it('never exposes the token hash', async () => {
    const result = await list.execute({});

    expect(result.data[0]).not.toHaveProperty('tokenHash');
  });

  describe('update', () => {
    it('sends only the fields actually supplied', async () => {
      await update.execute('device-1', { isActive: false });

      expect(repository.update).toHaveBeenCalledWith('device-1', {
        isActive: false,
      });
    });

    it('refuses an unknown device', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(update.execute('missing', { name: 'x' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    // A gate's scans are evidence; removing the tablet must not remove them.
    it('soft-deletes rather than hard-deletes', async () => {
      await remove.execute('device-1');

      expect(repository.softDelete).toHaveBeenCalledWith('device-1');
    });

    it('refuses an unknown device', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(remove.execute('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
