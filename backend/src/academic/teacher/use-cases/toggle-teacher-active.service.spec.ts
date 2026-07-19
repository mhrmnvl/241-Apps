import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { ToggleTeacherActiveUseCase } from './toggle-teacher-active.use-case.js';

describe('ToggleTeacherActiveUseCase', () => {
  let useCase: ToggleTeacherActiveUseCase;

  const mockRepo = {
    findById: jest.fn(),
    toggleUserActive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToggleTeacherActiveUseCase,
        { provide: TeacherRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<ToggleTeacherActiveUseCase>(
      ToggleTeacherActiveUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockTeacher = { id: 'e-1', user: { id: 'u-1', isActive: true } };

    it('should deactivate teacher user account', async () => {
      mockRepo.findById.mockResolvedValue(mockTeacher);
      mockRepo.toggleUserActive.mockResolvedValue({
        id: 'u-1',
        isActive: false,
      });

      await useCase.execute('e-1', false);

      expect(mockRepo.findById).toHaveBeenCalledWith('e-1');
      expect(mockRepo.toggleUserActive).toHaveBeenCalledWith('u-1', false);
    });

    it('should activate teacher user account', async () => {
      const inactiveTeacher = {
        id: 'e-1',
        user: { id: 'u-1', isActive: false },
      };
      mockRepo.findById.mockResolvedValue(inactiveTeacher);
      mockRepo.toggleUserActive.mockResolvedValue({
        id: 'u-1',
        isActive: true,
      });

      await useCase.execute('e-1', true);

      expect(mockRepo.toggleUserActive).toHaveBeenCalledWith('u-1', true);
    });

    it('should throw NotFoundException when teacher not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing', false)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.toggleUserActive).not.toHaveBeenCalled();
    });
  });
});
