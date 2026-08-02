import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IParentRepository } from '../domain/interfaces/parent-repository.interface.js';
import { DeleteParentUseCase } from './delete-parent.use-case.js';

describe('DeleteParentUseCase', () => {
  let useCase: DeleteParentUseCase;

  const mockRepo = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteParentUseCase,
        { provide: IParentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteParentUseCase>(DeleteParentUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'par-1';

    it('should soft-delete a parent successfully', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'par-1',
        name: 'Budi Santoso',
      });
      mockRepo.softDelete.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.softDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when parent is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.softDelete).not.toHaveBeenCalled();
    });
  });
});
