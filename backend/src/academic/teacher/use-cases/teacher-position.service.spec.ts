import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  CreateTeacherPositionDto,
  UpdateTeacherPositionDto,
} from '../dto/request/teacher-position.request.dto.js';
import { TeacherPositionsRepository } from '../repositories/teacher-position.repository.js';
import { TeacherRepository } from '../index.js';
import { TeacherPositionUseCase } from './teacher-position.use-case.js';

describe('TeacherPositionUseCase', () => {
  let useCase: TeacherPositionUseCase;

  const mockTeacherRepo = {
    findById: jest.fn(),
  };

  const mockPositionRepo = {
    findAll: jest.fn(),
    findPosition: jest.fn(),
    findAssignment: jest.fn(),
    assign: jest.fn(),
    findLinkById: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeacherPositionUseCase,
        { provide: TeacherRepository, useValue: mockTeacherRepo },
        { provide: TeacherPositionsRepository, useValue: mockPositionRepo },
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
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockPositionRepo.findAll.mockResolvedValue(mockPositions);

      const result = await useCase.findAll(teacherId);

      expect(mockTeacherRepo.findById).toHaveBeenCalledWith(teacherId);
      expect(mockPositionRepo.findAll).toHaveBeenCalledWith(teacherId);
      expect(result).toEqual(mockPositions);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      await expect(useCase.findAll(teacherId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepo.findAll).not.toHaveBeenCalled();
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
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockPositionRepo.findPosition.mockResolvedValue(activePosition);
      mockPositionRepo.findAssignment.mockResolvedValue(null);
      mockPositionRepo.assign.mockResolvedValue(mockLink);

      const result = await useCase.assign(teacherId, dto);

      expect(mockPositionRepo.findPosition).toHaveBeenCalledWith(
        dto.positionId,
      );
      expect(mockPositionRepo.assign).toHaveBeenCalledWith(teacherId, dto);
      expect(result).toEqual(mockLink);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      await expect(useCase.assign(teacherId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepo.assign).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when position does not exist', async () => {
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockPositionRepo.findPosition.mockResolvedValue(null);

      await expect(useCase.assign(teacherId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepo.assign).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when position is inactive', async () => {
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockPositionRepo.findPosition.mockResolvedValue({
        ...activePosition,
        isActive: false,
      });

      await expect(useCase.assign(teacherId, dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockPositionRepo.assign).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when same position already assigned on that date', async () => {
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockPositionRepo.findPosition.mockResolvedValue(activePosition);
      mockPositionRepo.findAssignment.mockResolvedValue({
        id: 'existing-link',
      });

      await expect(useCase.assign(teacherId, dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockPositionRepo.assign).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    const dto: UpdateTeacherPositionDto = { isPrimary: true };

    it('should update a position assignment successfully', async () => {
      const updatedLink = { id: 'link-1', isPrimary: true };
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockPositionRepo.findLinkById.mockResolvedValue({ id: 'link-1' });
      mockPositionRepo.update.mockResolvedValue(updatedLink);

      const result = await useCase.update(teacherId, linkId, dto);

      expect(mockPositionRepo.update).toHaveBeenCalledWith(
        teacherId,
        linkId,
        dto,
      );
      expect(result).toEqual(updatedLink);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      await expect(useCase.update(teacherId, linkId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when position assignment is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockPositionRepo.findLinkById.mockResolvedValue(null);

      await expect(useCase.update(teacherId, linkId, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepo.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a position assignment successfully', async () => {
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockPositionRepo.findLinkById.mockResolvedValue({ id: 'link-1' });
      mockPositionRepo.remove.mockResolvedValue(undefined);

      await useCase.remove(teacherId, linkId);

      expect(mockPositionRepo.remove).toHaveBeenCalledWith(linkId);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(null);

      await expect(useCase.remove(teacherId, linkId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when assignment is not found', async () => {
      mockTeacherRepo.findById.mockResolvedValue(mockTeacher);
      mockPositionRepo.findLinkById.mockResolvedValue(null);

      await expect(useCase.remove(teacherId, linkId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockPositionRepo.remove).not.toHaveBeenCalled();
    });
  });
});
