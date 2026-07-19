import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileAddressRepository } from '../repositories/profile-address.repository.js';
import { ProfileRepository } from '../index.js';
import { GetProfileAddressesUseCase } from './get-profile-addresses.use-case.js';

describe('GetProfileAddressesUseCase', () => {
  let useCase: GetProfileAddressesUseCase;

  const mockProfileRepo = { findByUserId: jest.fn() };
  const mockAddressRepo = { findAllByUserId: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileAddressesUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepo },
        { provide: ProfileAddressRepository, useValue: mockAddressRepo },
      ],
    }).compile();

    useCase = module.get<GetProfileAddressesUseCase>(
      GetProfileAddressesUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';

    it('should return addresses for a valid user', async () => {
      const mockProfile = { id: 'prof-1' };
      const mockAddresses = [{ id: 'addr-1', street: 'Jl. Veteran No. 1' }];
      mockProfileRepo.findByUserId.mockResolvedValue(mockProfile);
      mockAddressRepo.findAllByUserId.mockResolvedValue(mockAddresses);

      const result = await useCase.execute(userId);

      expect(mockProfileRepo.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockAddressRepo.findAllByUserId).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockAddresses);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      expect(mockAddressRepo.findAllByUserId).not.toHaveBeenCalled();
    });
  });
});
