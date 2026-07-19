import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentAddressRepository } from '../repositories/student-address.repository.js';
import { StudentRepository } from '../index.js';
import { RemoveStudentAddressUseCase } from './remove-student-address.use-case.js';

describe('RemoveStudentAddressUseCase', () => {
  let useCase: RemoveStudentAddressUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  const mockAddressRepo = {
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RemoveStudentAddressUseCase,
        { provide: StudentRepository, useValue: mockRepo },
        { provide: StudentAddressRepository, useValue: mockAddressRepo },
      ],
    }).compile();

    useCase = module.get<RemoveStudentAddressUseCase>(
      RemoveStudentAddressUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const studentId = 'stu-1';
    const addressId = 'addr-1';

    it('should remove an address successfully', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockAddressRepo.findOne.mockResolvedValue({ id: 'addr-1' });
      mockAddressRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(studentId, addressId);

      expect(mockRepo.findById).toHaveBeenCalledWith(studentId);
      expect(mockAddressRepo.findOne).toHaveBeenCalledWith(
        studentId,
        addressId,
      );
      expect(mockAddressRepo.remove).toHaveBeenCalledWith(addressId);
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(studentId, addressId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when address is not found for student', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockAddressRepo.findOne.mockResolvedValue(null);

      await expect(useCase.execute(studentId, addressId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.remove).not.toHaveBeenCalled();
    });
  });
});
