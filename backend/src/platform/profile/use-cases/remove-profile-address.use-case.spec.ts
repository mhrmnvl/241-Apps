import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileAddressRepository } from '../repositories/profile-address.repository.js';
import { ProfileRepository } from '../index.js';
import { RemoveProfileAddressUseCase } from './remove-profile-address.use-case.js';

describe('RemoveProfileAddressUseCase', () => {
  let useCase: RemoveProfileAddressUseCase;

  const mockProfileRepo = { findByUserId: jest.fn() };
  const mockAddressRepo = {
    findAddressForUser: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveProfileAddressUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepo },
        { provide: ProfileAddressRepository, useValue: mockAddressRepo },
      ],
    }).compile();

    useCase = module.get<RemoveProfileAddressUseCase>(
      RemoveProfileAddressUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';
    const addressId = 'addr-1';

    it('should remove address successfully', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findAddressForUser.mockResolvedValue({ id: 'addr-1' });
      mockAddressRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(userId, addressId);

      expect(mockProfileRepo.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockAddressRepo.findAddressForUser).toHaveBeenCalledWith(
        addressId,
        userId,
      );
      expect(mockAddressRepo.remove).toHaveBeenCalledWith(addressId);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, addressId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when address is not found for user', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findAddressForUser.mockResolvedValue(null);

      await expect(useCase.execute(userId, addressId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.remove).not.toHaveBeenCalled();
    });
  });
});
