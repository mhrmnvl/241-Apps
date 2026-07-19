import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAddressDto } from '../../../shared/dto/address.dto.js';
import { ProfileAddressRepository } from '../repositories/profile-address.repository.js';
import { ProfileRepository } from '../index.js';
import { UpdateProfileAddressUseCase } from './update-profile-address.use-case.js';

describe('UpdateProfileAddressUseCase', () => {
  let useCase: UpdateProfileAddressUseCase;

  const mockProfileRepo = { findByUserId: jest.fn() };
  const mockAddressRepo = {
    findAddressForUser: jest.fn(),
    clearPrimaryForStudentExclude: jest.fn(),
    clearPrimaryForTeacherExclude: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateProfileAddressUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepo },
        { provide: ProfileAddressRepository, useValue: mockAddressRepo },
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

      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findAddressForUser.mockResolvedValue(mockAddress);
      mockAddressRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(userId, addressId, dto);

      expect(mockProfileRepo.findByUserId).toHaveBeenCalledWith(userId);
      expect(mockAddressRepo.findAddressForUser).toHaveBeenCalledWith(
        addressId,
        userId,
      );
      expect(mockAddressRepo.update).toHaveBeenCalledWith(addressId, dto);
      expect(result).toEqual(updated);
    });

    it('should clear primary for student when isPrimary is true', async () => {
      const mockAddress = {
        id: 'addr-1',
        studentId: 'stu-1',
        teacherId: null,
      };
      const dtoPrimary: UpdateAddressDto = { isPrimary: true };

      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findAddressForUser.mockResolvedValue(mockAddress);
      mockAddressRepo.clearPrimaryForStudentExclude.mockResolvedValue(
        undefined,
      );
      mockAddressRepo.update.mockResolvedValue({
        ...mockAddress,
        isPrimary: true,
      });

      await useCase.execute(userId, addressId, dtoPrimary);

      expect(
        mockAddressRepo.clearPrimaryForStudentExclude,
      ).toHaveBeenCalledWith('stu-1', addressId);
      expect(
        mockAddressRepo.clearPrimaryForTeacherExclude,
      ).not.toHaveBeenCalled();
    });

    it('should clear primary for teacher when isPrimary is true', async () => {
      const mockAddress = {
        id: 'addr-1',
        studentId: null,
        teacherId: 'emp-1',
      };
      const dtoPrimary: UpdateAddressDto = { isPrimary: true };

      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findAddressForUser.mockResolvedValue(mockAddress);
      mockAddressRepo.clearPrimaryForTeacherExclude.mockResolvedValue(
        undefined,
      );
      mockAddressRepo.update.mockResolvedValue({
        ...mockAddress,
        isPrimary: true,
      });

      await useCase.execute(userId, addressId, dtoPrimary);

      expect(
        mockAddressRepo.clearPrimaryForTeacherExclude,
      ).toHaveBeenCalledWith('emp-1', addressId);
      expect(
        mockAddressRepo.clearPrimaryForStudentExclude,
      ).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, addressId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when address is not found for user', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findAddressForUser.mockResolvedValue(null);

      await expect(useCase.execute(userId, addressId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.update).not.toHaveBeenCalled();
    });
  });
});
