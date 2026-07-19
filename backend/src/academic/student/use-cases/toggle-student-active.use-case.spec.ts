import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentRepository } from '../repositories/student.repository.js';
import { ToggleStudentActiveUseCase } from './toggle-student-active.use-case.js';

describe('ToggleStudentActiveUseCase', () => {
  let useCase: ToggleStudentActiveUseCase;

  const mockRepo = {
    findById: jest.fn(),
    toggleUserActive: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToggleStudentActiveUseCase,
        { provide: StudentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<ToggleStudentActiveUseCase>(
      ToggleStudentActiveUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockStudent = { id: 's-1', user: { id: 'u-1', isActive: true } };

    it('should deactivate student user account', async () => {
      mockRepo.findById.mockResolvedValue(mockStudent);
      mockRepo.toggleUserActive.mockResolvedValue({
        id: 'u-1',
        isActive: false,
      });

      await useCase.execute('s-1', false);

      expect(mockRepo.findById).toHaveBeenCalledWith('s-1');
      expect(mockRepo.toggleUserActive).toHaveBeenCalledWith('u-1', false);
    });

    it('should activate student user account', async () => {
      const inactiveStudent = {
        id: 's-1',
        user: { id: 'u-1', isActive: false },
      };
      mockRepo.findById.mockResolvedValue(inactiveStudent);
      mockRepo.toggleUserActive.mockResolvedValue({
        id: 'u-1',
        isActive: true,
      });

      await useCase.execute('s-1', true);

      expect(mockRepo.toggleUserActive).toHaveBeenCalledWith('u-1', true);
    });

    it('should throw NotFoundException when student not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('missing', false)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepo.toggleUserActive).not.toHaveBeenCalled();
    });
  });
});
