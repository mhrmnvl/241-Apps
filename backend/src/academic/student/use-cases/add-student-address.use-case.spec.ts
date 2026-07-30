import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAddressDto } from '../../../shared/dto/address.dto.js';
import { StudentAddressRepository } from '../repositories/student-address.repository.js';
import { StudentRepository } from '../index.js';
import { AddStudentAddressUseCase } from './add-student-address.use-case.js';

describe('AddStudentAddressUseCase', () => {
  let useCase: AddStudentAddressUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  const mockAddressRepository = {
    clearPrimary: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddStudentAddressUseCase,
        { provide: StudentRepository, useValue: mockRepo },
        { provide: StudentAddressRepository, useValue: mockAddressRepository },
      ],
    }).compile();

    useCase = module.get<AddStudentAddressUseCase>(AddStudentAddressUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const studentId = 'stu-1';
    const dto: CreateAddressDto = {
      street: 'Jl. Veteran No. 1',
      rt: '001',
      rw: '002',
      village: 'Penanggungan',
      district: 'Klojen',
      city: 'Kota Malang',
      province: 'Jawa Timur',
      postalCode: '65113',
    };

    it('should add an address to a student', async () => {
      const created = { id: 'addr-1', ...dto };
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockAddressRepository.create.mockResolvedValue(created);

      const result = await useCase.execute(studentId, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(studentId);
      expect(mockAddressRepository.clearPrimary).not.toHaveBeenCalled();
      expect(mockAddressRepository.create).toHaveBeenCalledWith(studentId, dto);
      expect(result).toEqual(created);
    });

    it('should clear primary before creating when isPrimary is true', async () => {
      const dtoPrimary: CreateAddressDto = { ...dto, isPrimary: true };
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockAddressRepository.clearPrimary.mockResolvedValue(undefined);
      mockAddressRepository.create.mockResolvedValue({
        id: 'addr-1',
        isPrimary: true,
      });

      await useCase.execute(studentId, dtoPrimary);

      expect(mockAddressRepository.clearPrimary).toHaveBeenCalledWith(
        studentId,
      );
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(studentId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepository.create).not.toHaveBeenCalled();
    });
  });
});
