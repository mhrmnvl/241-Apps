import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAddressDto } from '../../../shared/dto/address.dto.js';
import { ProfileAddressRepository } from '../repositories/profile-address.repository.js';
import { ProfileRepository } from '../index.js';
import { AddProfileAddressUseCase } from './add-profile-address.use-case.js';

describe('AddProfileAddressUseCase', () => {
  let useCase: AddProfileAddressUseCase;

  const mockProfileRepo = { findByUserId: jest.fn() };
  const mockAddressRepo = {
    findStudentByUserId: jest.fn(),
    findTeacherByUserId: jest.fn(),
    clearPrimaryForStudent: jest.fn(),
    clearPrimaryForTeacher: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddProfileAddressUseCase,
        { provide: ProfileRepository, useValue: mockProfileRepo },
        { provide: ProfileAddressRepository, useValue: mockAddressRepo },
      ],
    }).compile();

    useCase = module.get<AddProfileAddressUseCase>(AddProfileAddressUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const userId = 'user-1';
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

    it('should add address for a student profile', async () => {
      const mockStudent = { id: 'stu-1' };
      const mockAddress = { id: 'addr-new', ...dto };

      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findStudentByUserId.mockResolvedValue(mockStudent);
      mockAddressRepo.create.mockResolvedValue(mockAddress);

      const result = await useCase.execute(userId, dto);

      expect(mockAddressRepo.create).toHaveBeenCalledWith(dto, {
        studentId: 'stu-1',
      });
      expect(result).toEqual(mockAddress);
    });

    it('should add address for an teacher profile', async () => {
      const mockTeacher = { id: 'emp-1' };
      const mockAddress = { id: 'addr-new', ...dto };

      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findStudentByUserId.mockResolvedValue(null);
      mockAddressRepo.findTeacherByUserId.mockResolvedValue(mockTeacher);
      mockAddressRepo.create.mockResolvedValue(mockAddress);

      const result = await useCase.execute(userId, dto);

      expect(mockAddressRepo.create).toHaveBeenCalledWith(dto, {
        teacherId: 'emp-1',
      });
      expect(result).toEqual(mockAddress);
    });

    it('should clear primary before adding when isPrimary is true (student)', async () => {
      const mockStudent = { id: 'stu-1' };
      const dtoPrimary: CreateAddressDto = { ...dto, isPrimary: true };

      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findStudentByUserId.mockResolvedValue(mockStudent);
      mockAddressRepo.clearPrimaryForStudent.mockResolvedValue(undefined);
      mockAddressRepo.create.mockResolvedValue({
        id: 'addr-new',
        ...dtoPrimary,
      });

      await useCase.execute(userId, dtoPrimary);

      expect(mockAddressRepo.clearPrimaryForStudent).toHaveBeenCalledWith(
        'stu-1',
      );
    });

    it('should throw NotFoundException when profile is not found', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when neither student nor teacher found', async () => {
      mockProfileRepo.findByUserId.mockResolvedValue({ id: 'prof-1' });
      mockAddressRepo.findStudentByUserId.mockResolvedValue(null);
      mockAddressRepo.findTeacherByUserId.mockResolvedValue(null);

      await expect(useCase.execute(userId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.create).not.toHaveBeenCalled();
    });
  });
});
