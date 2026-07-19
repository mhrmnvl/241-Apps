import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAcademicYearRepository } from '../domain/interfaces/academic-year-repository.interface.js';
import { DeleteAcademicYearUseCase } from './delete-academic-year.use-case.js';

describe('DeleteAcademicYearUseCase', () => {
  let useCase: DeleteAcademicYearUseCase;

  const mockRepository = {
    findById: jest.fn(),
    hasRelatedData: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAcademicYearUseCase,
        { provide: IAcademicYearRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteAcademicYearUseCase>(DeleteAcademicYearUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ay-1';

    it('should soft-delete an academic year successfully', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'ay-1',
        name: '2024/2025',
        isActive: false,
      });
      mockRepository.hasRelatedData.mockResolvedValue(false);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.hasRelatedData).toHaveBeenCalledWith(id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when ID not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when deleting active year', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'ay-1',
        name: '2024/2025',
        isActive: true,
      });

      await expect(useCase.execute(id)).rejects.toThrow(BadRequestException);
      expect(mockRepository.hasRelatedData).not.toHaveBeenCalled();
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when year has enrollment data', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'ay-1',
        name: '2024/2025',
        isActive: false,
      });
      mockRepository.hasRelatedData.mockResolvedValue(true);

      await expect(useCase.execute(id)).rejects.toThrow(BadRequestException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
