import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IPositionRepository } from '../interfaces/position-repository.interface.js';
import { DeletePositionUseCase } from './delete-position.use-case.js';

describe('DeletePositionUseCase', () => {
  let useCase: DeletePositionUseCase;

  const mockRepo = {
    findById: jest.fn(),
    countActiveAssignments: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeletePositionUseCase,
        { provide: IPositionRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeletePositionUseCase>(DeletePositionUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'pos-1';

    it('should delete a position successfully when not assigned', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'pos-1',
        name: 'Kepala Sekolah',
      });
      mockRepo.countActiveAssignments.mockResolvedValue(0);
      mockRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.countActiveAssignments).toHaveBeenCalledWith(id);
      expect(mockRepo.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when position is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      mockRepo.countActiveAssignments.mockResolvedValue(0);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when position is still assigned to teachers', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'pos-1',
        name: 'Kepala Sekolah',
      });
      mockRepo.countActiveAssignments.mockResolvedValue(3);

      await expect(useCase.execute(id)).rejects.toThrow(ConflictException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });
  });
});
