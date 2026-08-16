import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ISemesterRepository } from '../domain/interfaces/semester-repository.interface.js';
import { DeleteSemesterUseCase } from './delete-semester.use-case.js';

describe('DeleteSemesterUseCase', () => {
  let useCase: DeleteSemesterUseCase;

  const mockRepository = {
    findById: jest.fn(),
    findFirstDependent: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteSemesterUseCase,
        { provide: ISemesterRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteSemesterUseCase>(DeleteSemesterUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should soft-delete a semester', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'sem-1',
        typeId: 'type-odd',
        type: { id: 'type-odd', name: 'ODD' },
        isActive: false,
        academicYear: { id: 'ay-1', name: '2024/2025' },
      });
      mockRepository.findFirstDependent.mockResolvedValue(null);
      mockRepository.softDelete.mockResolvedValue(undefined);

      await useCase.execute('sem-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('sem-1');
      expect(mockRepository.findFirstDependent).toHaveBeenCalledWith('sem-1');
      expect(mockRepository.softDelete).toHaveBeenCalledWith('sem-1');
    });

    it('should throw NotFoundException when semester not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when deleting active semester', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'sem-1',
        typeId: 'type-odd',
        type: { id: 'type-odd', name: 'ODD' },
        isActive: true,
        academicYear: { id: 'ay-1', name: '2024/2025' },
      });

      await expect(useCase.execute('sem-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.findFirstDependent).not.toHaveBeenCalled();
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });

    it('should refuse to delete a semester that is in use, naming what holds it', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'sem-1',
        typeId: 'type-odd',
        type: { id: 'type-odd', name: 'ODD' },
        isActive: false,
        academicYear: { id: 'ay-1', name: '2024/2025' },
      });
      mockRepository.findFirstDependent.mockResolvedValue('student enrolments');

      await expect(useCase.execute('sem-1')).rejects.toThrow(
        BadRequestException,
      );
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
