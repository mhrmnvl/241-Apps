import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ParentRelation } from '@prisma/client';
import { CreateStudentParentDto } from '../dto/create-student-parent.dto.js';
import { StudentParentRepository } from '../repositories/student-parent.repository.js';
import { CreateStudentParentUseCase } from './create-student-parent.use-case.js';

describe('CreateStudentParentUseCase', () => {
  let useCase: CreateStudentParentUseCase;

  const mockRepo = {
    findStudent: jest.fn(),
    findParent: jest.fn(),
    findPair: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateStudentParentUseCase,
        { provide: StudentParentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateStudentParentUseCase>(
      CreateStudentParentUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateStudentParentDto = {
      studentId: '550e8400-e29b-41d4-a716-446655440001',
      parentId: '550e8400-e29b-41d4-a716-446655440003',
      relation: ParentRelation.FATHER,
    };

    it('should create student-parent link successfully', async () => {
      const created = { id: 'link-1', ...dto };
      mockRepo.findStudent.mockResolvedValue({ id: dto.studentId });
      mockRepo.findParent.mockResolvedValue({ id: dto.parentId });
      mockRepo.findPair.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(created);

      const result = await useCase.execute(dto);

      expect(mockRepo.findStudent).toHaveBeenCalledWith(dto.studentId);
      expect(mockRepo.findParent).toHaveBeenCalledWith(dto.parentId);
      expect(mockRepo.findPair).toHaveBeenCalledWith(
        dto.studentId,
        dto.parentId,
      );
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(created);
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockRepo.findStudent.mockResolvedValue(null);
      mockRepo.findParent.mockResolvedValue({ id: dto.parentId });

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.findPair).not.toHaveBeenCalled();
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when parent is not found', async () => {
      mockRepo.findStudent.mockResolvedValue({ id: dto.studentId });
      mockRepo.findParent.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.findPair).not.toHaveBeenCalled();
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when link already exists', async () => {
      mockRepo.findStudent.mockResolvedValue({ id: dto.studentId });
      mockRepo.findParent.mockResolvedValue({ id: dto.parentId });
      mockRepo.findPair.mockResolvedValue({ id: 'link-existing' });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
