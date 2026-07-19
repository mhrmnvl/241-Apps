import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateAddressDto,
  UpdateAddressDto,
} from '../../../shared/dto/address.dto.js';
import { TeacherAddressRepository } from '../repositories/teacher-address.repository.js';
import { TeacherRepository } from '../index.js';
import { TeacherAddressUseCase } from './teacher-address.use-case.js';

describe('TeacherAddressUseCase', () => {
  let useCase: TeacherAddressUseCase;

  const mockTeacherRepo = {
    findById: jest.fn(),
  };

  const mockAddressRepo = {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherAddressUseCase,
        { provide: TeacherRepository, useValue: mockTeacherRepo },
        { provide: TeacherAddressRepository, useValue: mockAddressRepo },
      ],
    }).compile();

    useCase = module.get<TeacherAddressUseCase>(TeacherAddressUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  const teacherId = 'emp-1';
  const addressId = 'addr-1';
  const mockTeacher = { id: teacherId };

  describe('findAll', () => {
    it('should return all addresses for a teacher', async () => {
      const mockAddresses = [
        { id: 'addr-1', street: 'Jl. Veteran No. 1', city: 'Malang' },
      ];
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockAddressRepo.findAll.mockResolvedValue(mockAddresses);

      const result = await useCase.findAll(teacherId);

      expect(mockTeacherRepo.findById).toHaveBeenCalledWith(teacherId);
      expect(mockAddressRepo.findAll).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(mockAddresses);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      await expect(useCase.findAll(teacherId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.findAll).not.toHaveBeenCalled();
    });
  });

  describe('add', () => {
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

    it('should add an address to an teacher successfully', async () => {
      const mockAddress = { id: 'addr-1', ...dto };
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockAddressRepo.create.mockResolvedValue(mockAddress);

      const result = await useCase.add(teacherId, dto);

      expect(mockTeacherRepo.findById).toHaveBeenCalledWith(teacherId);
      expect(mockAddressRepo.create).toHaveBeenCalledWith(teacherId, dto);
      expect(result).toEqual(mockAddress);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      await expect(useCase.add(teacherId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const dto: UpdateAddressDto = { street: 'Jl. Soekarno Hatta No. 5' };

    it('should update an address successfully', async () => {
      const updatedAddress = {
        id: 'addr-1',
        street: 'Jl. Soekarno Hatta No. 5',
      };
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockAddressRepo.findById.mockResolvedValue({ id: 'addr-1' });
      mockAddressRepo.update.mockResolvedValue(updatedAddress);

      const result = await useCase.update(teacherId, addressId, dto);

      expect(mockAddressRepo.update).toHaveBeenCalledWith(
        teacherId,
        addressId,
        dto,
      );
      expect(result).toEqual(updatedAddress);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      await expect(useCase.update(teacherId, addressId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when address is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockAddressRepo.findById.mockResolvedValue(null);

      await expect(useCase.update(teacherId, addressId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an address successfully', async () => {
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockAddressRepo.findById.mockResolvedValue({ id: 'addr-1' });
      mockAddressRepo.remove.mockResolvedValue(undefined);

      await useCase.remove(teacherId, addressId);

      expect(mockAddressRepo.remove).toHaveBeenCalledWith(addressId);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      await expect(useCase.remove(teacherId, addressId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when address is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockAddressRepo.findById.mockResolvedValue(null);

      await expect(useCase.remove(teacherId, addressId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockAddressRepo.remove).not.toHaveBeenCalled();
    });
  });
});
