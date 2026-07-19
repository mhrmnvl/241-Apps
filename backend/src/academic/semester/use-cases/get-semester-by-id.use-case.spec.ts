import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';
import { GetSemesterByIdUseCase } from './get-semester-by-id.use-case.js';

describe('GetSemesterByIdUseCase', () => {
  let useCase: GetSemesterByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSemesterByIdUseCase,
        { provide: ISemesterRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetSemesterByIdUseCase>(GetSemesterByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return a semester when found', async () => {
      const semester = {
        id: 'sem-1',
        typeId: 'type-odd',
        type: { id: 'type-odd', name: 'ODD' },
        isActive: false,
        academicYear: { id: 'ay-1', name: '2024/2025' },
      };
      mockRepository.findById.mockResolvedValue(semester);

      const result = await useCase.execute('sem-1');

      expect(result).toEqual(semester);
      expect(mockRepository.findById).toHaveBeenCalledWith('sem-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
