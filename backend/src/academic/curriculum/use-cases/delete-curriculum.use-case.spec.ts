import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';
import { DeleteCurriculaUseCase } from './delete-curriculum.use-case.js';

describe('DeleteCurriculaUseCase', () => {
  let useCase: DeleteCurriculaUseCase;

  const mockRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCurriculaUseCase,
        { provide: ICurriculumRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteCurriculaUseCase>(DeleteCurriculaUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'curr-uuid-1';

    it('should soft-delete a curricula successfully', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'curr-uuid-1',
        name: 'Kurikulum Merdeka',
        academicYearId: '550e8400-e29b-41d4-a716-446655440009',
      });
      mockRepository.softDelete.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when curricula not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
