import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateAddressDto } from '../../../shared/dto/address.dto.js';
import { StudentAddressRepository } from '../repositories/student-address.repository.js';
import { StudentRepository } from '../index.js';
import { UpdateStudentAddressUseCase } from './update-student-address.use-case.js';

describe('UpdateStudentAddressUseCase', () => {
  let useCase: UpdateStudentAddressUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  const mockAddressRepository = {
    findOne: jest.fn(),
    clearPrimaryExclude: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStudentAddressUseCase,
        { provide: StudentRepository, useValue: mockRepo },
        { provide: StudentAddressRepository, useValue: mockAddressRepository },
      ],
    }).compile();

    useCase = module.get<UpdateStudentAddressUseCase>(
      UpdateStudentAddressUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const studentId = 'stu-1';
    const addressId = 'addr-1';

    it('should update address successfully', async () => {
      const dto: UpdateAddressDto = { city: 'Surabaya' };
      const updated = { id: 'addr-1', city: 'Surabaya' };
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockAddressRepository.findOne.mockResolvedValue({ id: 'addr-1' });
      mockAddressRepository.update.mockResolvedValue(updated);

      const result = await useCase.execute(studentId, addressId, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(studentId);
      expect(mockAddressRepository.findOne).toHaveBeenCalledWith(
        studentId,
        addressId,
      );
      expect(mockAddressRepository.clearPrimaryExclude).not.toHaveBeenCalled();
      expect(mockAddressRepository.update).toHaveBeenCalledWith(addressId, dto);
      expect(result).toEqual(updated);
    });

    it('should clear primary for other addresses when isPrimary is true', async () => {
      const dto: UpdateAddressDto = { isPrimary: true };
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockAddressRepository.findOne.mockResolvedValue({ id: 'addr-1' });
      mockAddressRepository.clearPrimaryExclude.mockResolvedValue(undefined);
      mockAddressRepository.update.mockResolvedValue({
        id: 'addr-1',
        isPrimary: true,
      });

      await useCase.execute(studentId, addressId, dto);

      expect(mockAddressRepository.clearPrimaryExclude).toHaveBeenCalledWith(
        studentId,
        addressId,
      );
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(studentId, addressId, {})).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when address is not found for student', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockAddressRepository.findOne.mockResolvedValue(null);

      await expect(useCase.execute(studentId, addressId, {})).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepository.update).not.toHaveBeenCalled();
    });
  });
});
