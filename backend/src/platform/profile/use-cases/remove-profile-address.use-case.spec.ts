import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IProfileAddressRepository } from '../domain/interfaces/profile-address-repository.interface.js';
import { IProfileRepository } from '../index.js';
import { RemoveProfileAddressUseCase } from './remove-profile-address.use-case.js';

describe('RemoveProfileAddressUseCase', () => {
  let useCase: RemoveProfileAddressUseCase;

  const mockProfileRepository = { findByUserId: jest.fn() };
  const mockAddressRepository = {
    findAddressForUser: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveProfileAddressUseCase,
        { provide: IProfileRepository, useValue: mockProfileRepository },
        { provide: IProfileAddressRepository, useValue: mockAddressRepository },
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
      mockProfileRepository.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepository.findAddressForUser.mockResolvedValue({
        id: 'addr-1',
      });
      mockAddressRepository.remove.mockResolvedValue(undefined);

      await useCase.execute(userId, addressId);

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockAddressRepository.findAddressForUser).toHaveBeenCalledWith(
        addressId,
        userId,
      );
      expect(mockAddressRepository.remove).toHaveBeenCalledWith(addressId);
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, addressId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepository.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when address is not found for user', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepository.findAddressForUser.mockResolvedValue(null);

      await expect(useCase.execute(userId, addressId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepository.remove).not.toHaveBeenCalled();
    });
  });
});
