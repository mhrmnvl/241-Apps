import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ParentRepository } from '../repositories/parent.repository.js';
import { GetParentByIdUseCase } from './get-parent-by-id.use-case.js';

describe('GetParentByIdUseCase', () => {
  let useCase: GetParentByIdUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetParentByIdUseCase,
        { provide: ParentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetParentByIdUseCase>(GetParentByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'par-1';

    it('should return a parent when found', async () => {
      const mockParent = { id: 'par-1', name: 'Budi Santoso' };
      mockRepo.findById.mockResolvedValue(mockParent);

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockParent);
    });

    it('should throw NotFoundException when parent is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
    });
  });
});
