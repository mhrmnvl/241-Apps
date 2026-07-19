import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ICurriculumRepository } from '../domain/interfaces/curriculum-repository.interface.js';
import { GetCurriculaByIdUseCase } from './get-curricula-by-id.use-case.js';

describe('GetCurriculaByIdUseCase', () => {
  let useCase: GetCurriculaByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetCurriculaByIdUseCase,
        { provide: ICurriculumRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetCurriculaByIdUseCase>(GetCurriculaByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'curr-uuid-1';

    it('should return a curricula when found', async () => {
      const mockCurricula = {
        id: 'curr-uuid-1',
        name: 'Kurikulum Merdeka',
        academicYearId: '550e8400-e29b-41d4-a716-446655440009',
        isActive: true,
      };
      mockRepository.findById.mockResolvedValue(mockCurricula);

      const result = await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockCurricula);
    });

    it('should throw NotFoundException when curricula not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.findById).toHaveBeenCalledWith(id);
    });
  });
});
