import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateGradeDto } from '../dto/update-grade.dto.js';
import { IClassroomLevelsRepository } from '../domain/interfaces/classroom-levels-repository.interface.js';
import { UpdateClassroomLevelUseCase } from './update-grade.use-case.js';

describe('UpdateClassroomLevelUseCase', () => {
  let useCase: UpdateClassroomLevelUseCase;

  const mockRepository = {
    findById: jest.fn(),
    findByLevel: jest.fn(),
    findByName: jest.fn(),
    update: jest.fn(),
  };

  const existing = { id: 'lvl-1', level: 7, name: 'VII', isActive: true };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClassroomLevelUseCase,
        { provide: IClassroomLevelsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateClassroomLevelUseCase>(
      UpdateClassroomLevelUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update when no key fields change', async () => {
      const dto: UpdateGradeDto = { isActive: false };
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.update.mockResolvedValue({ ...existing, isActive: false });

      const result = await useCase.execute('lvl-1', dto);

      expect(mockRepository.findByLevel).not.toHaveBeenCalled();
      expect(mockRepository.findByName).not.toHaveBeenCalled();
      expect(result.isActive).toBe(false);
    });

    it('should check duplicate when level changes', async () => {
      const dto: UpdateGradeDto = { level: 8 };
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.findByLevel.mockResolvedValue(null);
      mockRepository.update.mockResolvedValue({ ...existing, level: 8 });

      await useCase.execute('lvl-1', dto);

      expect(mockRepository.findByLevel).toHaveBeenCalledWith(8);
    });

    it('should throw ConflictException when duplicate level found', async () => {
      const dto: UpdateGradeDto = { level: 8 };
      mockRepository.findById.mockResolvedValue(existing);
      mockRepository.findByLevel.mockResolvedValue({ id: 'lvl-other' });

      await expect(useCase.execute('lvl-1', dto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('lvl-missing', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
