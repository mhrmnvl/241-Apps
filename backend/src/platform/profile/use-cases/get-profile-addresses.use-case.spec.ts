import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IProfileAddressRepository } from '../domain/interfaces/profile-address-repository.interface.js';
import { IProfileRepository } from '../index.js';
import { GetProfileAddressesUseCase } from './get-profile-addresses.use-case.js';

describe('GetProfileAddressesUseCase', () => {
  let useCase: GetProfileAddressesUseCase;

  const mockProfileRepository = { findByUserId: jest.fn() };
  const mockAddressRepository = { findAllByUserId: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProfileAddressesUseCase,
        { provide: IProfileRepository, useValue: mockProfileRepository },
        { provide: IProfileAddressRepository, useValue: mockAddressRepository },
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
      mockProfileRepository.findByUserId.mockResolvedValue(mockProfile);
      mockAddressRepository.findAllByUserId.mockResolvedValue(mockAddresses);

      const result = await useCase.execute(userId);

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockAddressRepository.findAllByUserId).toHaveBeenCalledWith(
        userId,
      );
      expect(result).toEqual(mockAddresses);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId)).rejects.toThrow(NotFoundException);
      expect(mockAddressRepository.findAllByUserId).not.toHaveBeenCalled();
    });
  });
});
