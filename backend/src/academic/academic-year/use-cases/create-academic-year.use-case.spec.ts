import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateAcademicYearDto } from '../dto/create-academic-year.dto.js';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';
import { CreateAcademicYearUseCase } from './create-academic-year.use-case.js';

describe('CreateAcademicYearUseCase', () => {
  let useCase: CreateAcademicYearUseCase;

  const mockRepository: Record<string, jest.Mock> = {
    findByName: jest.fn(),
    deactivateAll: jest.fn(),
    create: jest.fn(),
  };

  const mockAcademicYear = {
    id: 'ay-1',
    name: '2025/2026',
    isActive: false,
    deletedAt: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAcademicYearUseCase,
        { provide: IAcademicYearRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateAcademicYearUseCase>(CreateAcademicYearUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateAcademicYearDto = { name: '2025/2026' };

    it('should create academic year', async () => {
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockAcademicYear);

      const result = await useCase.execute(dto);

      expect(mockRepository.findByName).toHaveBeenCalledWith('2025/2026');
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: '2025/2026',
        isActive: false,
      });
      expect(result.name).toBe('2025/2026');
    });

    it('should throw ConflictException when name already exists', async () => {
      mockRepository.findByName.mockResolvedValue({
        id: 'existing-id',
        name: '2025/2026',
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should deactivate all others when isActive is true', async () => {
      const activeDto: CreateAcademicYearDto = {
        name: '2025/2026',
        isActive: true,
      };

      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.deactivateAll.mockResolvedValue({ count: 1 });
      mockRepository.create.mockResolvedValue({
        ...mockAcademicYear,
        isActive: true,
      });

      await useCase.execute(activeDto);

      expect(mockRepository.deactivateAll).toHaveBeenCalledWith();
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: '2025/2026',
        isActive: true,
      });
    });

    it('should NOT deactivate others when isActive is false/undefined', async () => {
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockAcademicYear);

      await useCase.execute(dto);

      expect(mockRepository.deactivateAll).not.toHaveBeenCalled();
    });
  });
});
