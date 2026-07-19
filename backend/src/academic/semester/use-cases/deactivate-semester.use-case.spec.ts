import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';
import { DeactivateSemesterUseCase } from './deactivate-semester.use-case.js';

describe('DeactivateSemesterUseCase', () => {
  let useCase: DeactivateSemesterUseCase;

  const mockRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const activeSemester = {
    id: 'sem-1',
    type: 'ODD',
    isActive: true,
    academicYear: { id: 'ay-1', name: '2024/2025' },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeactivateSemesterUseCase,
        { provide: ISemesterRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeactivateSemesterUseCase>(DeactivateSemesterUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return current if already inactive', async () => {
      const inactiveSemester = { ...activeSemester, isActive: false };
      mockRepository.findById.mockResolvedValue(inactiveSemester);

      const result = await useCase.execute('sem-1');

      expect(result).toEqual(inactiveSemester);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should deactivate an active semester', async () => {
      const deactivatedSemester = { ...activeSemester, isActive: false };
      mockRepository.findById.mockResolvedValue(activeSemester);
      mockRepository.update.mockResolvedValue(deactivatedSemester);

      const result = await useCase.execute('sem-1');

      expect(mockRepository.update).toHaveBeenCalledWith('sem-1', {
        isActive: false,
      });
      expect(result.isActive).toBe(false);
    });
  });
});
