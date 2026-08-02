import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTeacherPositionDto } from '../dto/request/create-teacher-position.dto.js';
import { UpdateTeacherPositionDto } from '../dto/request/update-teacher-position.dto.js';
import { ITeacherPositionRepository } from '../domain/interfaces/teacher-position-repository.interface.js';
import { ITeacherRepository } from '../index.js';
import { TeacherPositionUseCase } from './teacher-position.use-case.js';

describe('TeacherPositionUseCase', () => {
  let useCase: TeacherPositionUseCase;

  const mockTeacherRepository = {
    findById: jest.fn(),
  };

  const mockPositionRepository = {
    findByTeacherId: jest.fn(),
    findPositionById: jest.fn(),
    findByTeacherAndPosition: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherPositionUseCase,
        { provide: ITeacherRepository, useValue: mockTeacherRepository },
        {
          provide: ITeacherPositionRepository,
          useValue: mockPositionRepository,
        },
      ],
    }).compile();

    useCase = module.get<TeacherPositionUseCase>(TeacherPositionUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  const teacherId = 'emp-1';
  const linkId = 'link-1';
  const mockTeacher = { id: 'emp-1', user: { id: 'u-1' } };

  describe('findAll', () => {
    it('should return all position assignments for an teacher', async () => {
      const mockPositions = [
        { id: 'link-1', position: { name: 'Guru Kelas' } },
      ];
      mockTeacherRepository.findById.mockResolvedValue(mockTeacher);
      mockPositionRepository.findByTeacherId.mockResolvedValue(mockPositions);

      const result = await useCase.findAll(teacherId);

      expect(mockTeacherRepository.findById).toHaveBeenCalledWith(teacherId);
      expect(mockPositionRepository.findByTeacherId).toHaveBeenCalledWith(
        teacherId,
      );
      expect(result).toEqual(mockPositions);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepository.findById.mockResolvedValue(null);

      await expect(useCase.findAll(teacherId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepository.findByTeacherId).not.toHaveBeenCalled();
    });
  });

  describe('assign', () => {
    const dto: CreateTeacherPositionDto = {
      positionId: 'pos-1',
      hireDate: '2020-01-01',
    };
    const activePosition = { id: 'pos-1', name: 'Guru Kelas', isActive: true };
    const mockLink = { id: 'link-1', positionId: 'pos-1' };

    it('should assign a position to an teacher successfully', async () => {
      mockTeacherRepository.findById.mockResolvedValue(mockTeacher);
      mockPositionRepository.findPositionById.mockResolvedValue(activePosition);
      mockPositionRepository.findByTeacherAndPosition.mockResolvedValue(null);
      mockPositionRepository.create.mockResolvedValue(mockLink);

      const result = await useCase.assign(teacherId, dto);

      expect(mockPositionRepository.findPositionById).toHaveBeenCalledWith(
        dto.positionId,
      );
      // The port takes a real Date; the use case converts the ISO string.
      expect(mockPositionRepository.create).toHaveBeenCalledWith(teacherId, {
        ...dto,
        hireDate: new Date(dto.hireDate),
      });
      expect(result).toEqual(mockLink);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepository.findById.mockResolvedValue(null);

      await expect(useCase.assign(teacherId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when position does not exist', async () => {
      mockTeacherRepository.findById.mockResolvedValue(mockTeacher);
      mockPositionRepository.findPositionById.mockResolvedValue(null);

      await expect(useCase.assign(teacherId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when position is inactive', async () => {
      mockTeacherRepository.findById.mockResolvedValue(mockTeacher);
      mockPositionRepository.findPositionById.mockResolvedValue({
        ...activePosition,
        isActive: false,
      });

      await expect(useCase.assign(teacherId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPositionRepository.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when same position already assigned on that date', async () => {
      mockTeacherRepository.findById.mockResolvedValue(mockTeacher);
      mockPositionRepository.findPositionById.mockResolvedValue(activePosition);
      mockPositionRepository.findByTeacherAndPosition.mockResolvedValue({
        id: 'existing-link',
      });

      await expect(useCase.assign(teacherId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPositionRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const dto: UpdateTeacherPositionDto = { isPrimary: true };

    it('should update a position assignment successfully', async () => {
      const updatedLink = { id: 'link-1', isPrimary: true };
      mockTeacherRepository.findById.mockResolvedValue(mockTeacher);
      mockPositionRepository.findById.mockResolvedValue({ id: 'link-1' });
      mockPositionRepository.update.mockResolvedValue(updatedLink);

      const result = await useCase.update(teacherId, linkId, dto);

      expect(mockPositionRepository.update).toHaveBeenCalledWith(
        teacherId,
        linkId,
        dto,
      );
      expect(result).toEqual(updatedLink);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepository.findById.mockResolvedValue(null);

      await expect(useCase.update(teacherId, linkId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when position assignment is not found', async () => {
      mockTeacherRepository.findById.mockResolvedValue(mockTeacher);
      mockPositionRepository.findById.mockResolvedValue(null);

      await expect(useCase.update(teacherId, linkId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepository.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a position assignment successfully', async () => {
      mockTeacherRepository.findById.mockResolvedValue(mockTeacher);
      mockPositionRepository.findById.mockResolvedValue({ id: 'link-1' });
      mockPositionRepository.softDelete.mockResolvedValue(undefined);

      await useCase.remove(teacherId, linkId);

      expect(mockPositionRepository.softDelete).toHaveBeenCalledWith(
        teacherId,
        linkId,
      );
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepository.findById.mockResolvedValue(null);

      await expect(useCase.remove(teacherId, linkId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when assignment is not found', async () => {
      mockTeacherRepository.findById.mockResolvedValue(mockTeacher);
      mockPositionRepository.findById.mockResolvedValue(null);

      await expect(useCase.remove(teacherId, linkId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
