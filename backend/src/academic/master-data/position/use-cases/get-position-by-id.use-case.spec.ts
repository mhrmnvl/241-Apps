import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IPositionRepository } from '../domain/interfaces/position-repository.interface.js';
import { GetPositionByIdUseCase } from './get-position-by-id.use-case.js';

describe('GetPositionByIdUseCase', () => {
  let useCase: GetPositionByIdUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPositionByIdUseCase,
        { provide: IPositionRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetPositionByIdUseCase>(GetPositionByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'pos-1';

    it('should return a position when found', async () => {
      const mockPosition = { id: 'pos-1', name: 'Kepala Sekolah' };
      mockRepo.findById.mockResolvedValue(mockPosition);

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockPosition);
    });

    it('should throw NotFoundException when position is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
    });
  });
});
