import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';
import { GetAcademicYearByIdUseCase } from './get-academic-year-by-id.use-case.js';

describe('GetAcademicYearByIdUseCase', () => {
  let useCase: GetAcademicYearByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAcademicYearByIdUseCase,
        { provide: IAcademicYearRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetAcademicYearByIdUseCase>(
      GetAcademicYearByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ay-1';

    it('should return an academic year by ID', async () => {
      const mockYear = { id: 'ay-1', name: '2024/2025', isActive: true };
      mockRepository.findById.mockResolvedValue(mockYear);

      const result = await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockYear);
    });

    it('should throw NotFoundException when ID not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
