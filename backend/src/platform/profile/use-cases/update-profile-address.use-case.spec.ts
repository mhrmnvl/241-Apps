import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAddressDto } from '../../../shared/dto/address.dto.js';
import { ProfileAddressRepository } from '../repositories/profile-address.repository.js';
import { ProfileRepository } from '../index.js';
import { UpdateProfileAddressUseCase } from './update-profile-address.use-case.js';

describe('UpdateProfileAddressUseCase', () => {
  let useCase: UpdateProfileAddressUseCase;

  const mockProfileRepository = { findByUserId: jest.fn() };
  const mockAddressRepository = {
    findAddressForUser: jest.fn(),
    clearPrimaryForStudentExclude: jest.fn(),
    clearPrimaryForTeacherExclude: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileAddressUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepository },
        { provide: ProfileAddressRepository, useValue: mockAddressRepository },
      ],
    }).compile();

    useCase = module.get<UpdateProfileAddressUseCase>(
      UpdateProfileAddressUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';
    const addressId = 'addr-1';
    const dto: UpdateAddressDto = { street: 'Jl. Baru No. 2' };

    it('should update address for a student profile', async () => {
      const mockAddress = {
        id: 'addr-1',
        studentId: 'stu-1',
        teacherId: null,
      };
      const updated = { ...mockAddress, street: 'Jl. Baru No. 2' };

      mockProfileRepository.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepository.findAddressForUser.mockResolvedValue(mockAddress);
      mockAddressRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute(userId, addressId, dto);

      expect(mockProfileRepository.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockAddressRepository.findAddressForUser).toHaveBeenCalledWith(
        addressId,
        userId,
      );
      expect(mockAddressRepository.update).toHaveBeenCalledWith(addressId, dto);
      expect(result).toEqual(updated);
    });

    it('should clear primary for student when isPrimary is true', async () => {
      const mockAddress = {
        id: 'addr-1',
        studentId: 'stu-1',
        teacherId: null,
      };
      const dtoPrimary: UpdateAddressDto = { isPrimary: true };

      mockProfileRepository.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepository.findAddressForUser.mockResolvedValue(mockAddress);
      mockAddressRepository.clearPrimaryForStudentExclude.mockResolvedValue(
        undefined,
      );
      mockAddressRepository.update.mockResolvedValue({
        ...mockAddress,
        isPrimary: true,
      });

      await useCase.execute(userId, addressId, dtoPrimary);

      expect(
        mockAddressRepository.clearPrimaryForStudentExclude,
      ).toHaveBeenCalledWith('stu-1', addressId);
      expect(
        mockAddressRepository.clearPrimaryForTeacherExclude,
      ).not.toHaveBeenCalled();
    });

    it('should clear primary for teacher when isPrimary is true', async () => {
      const mockAddress = {
        id: 'addr-1',
        studentId: null,
        teacherId: 'emp-1',
      };
      const dtoPrimary: UpdateAddressDto = { isPrimary: true };

      mockProfileRepository.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepository.findAddressForUser.mockResolvedValue(mockAddress);
      mockAddressRepository.clearPrimaryForTeacherExclude.mockResolvedValue(
        undefined,
      );
      mockAddressRepository.update.mockResolvedValue({
        ...mockAddress,
        isPrimary: true,
      });

      await useCase.execute(userId, addressId, dtoPrimary);

      expect(
        mockAddressRepository.clearPrimaryForTeacherExclude,
      ).toHaveBeenCalledWith('emp-1', addressId);
      expect(
        mockAddressRepository.clearPrimaryForStudentExclude,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, addressId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when address is not found for user', async () => {
      mockProfileRepository.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepository.findAddressForUser.mockResolvedValue(null);

      await expect(useCase.execute(userId, addressId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepository.update).not.toHaveBeenCalled();
    });
  });
});
