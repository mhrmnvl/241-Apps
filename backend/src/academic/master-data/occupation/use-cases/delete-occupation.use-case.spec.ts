import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IOccupationRepository } from '../domain/interfaces/occupation-repository.interface.js';
import { DeleteOccupationUseCase } from './delete-occupation.use-case.js';

describe('DeleteOccupationUseCase', () => {
  let useCase: DeleteOccupationUseCase;

  const mockRepo = {
    findById: jest.fn(),
    countActiveParents: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteOccupationUseCase,
        { provide: IOccupationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<DeleteOccupationUseCase>(DeleteOccupationUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'occ-1';

    it('should delete an occupation successfully when not in use', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'occ-1', name: 'Wiraswasta' });
      mockRepo.countActiveParents.mockResolvedValue(0);
      mockRepo.remove.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.countActiveParents).toHaveBeenCalledWith(id);
      expect(mockRepo.remove).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when occupation is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      mockRepo.countActiveParents.mockResolvedValue(0);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when occupation is still in use', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'occ-1', name: 'Wiraswasta' });
      mockRepo.countActiveParents.mockResolvedValue(3);

      await expect(useCase.execute(id)).rejects.toThrow(ConflictException);
      expect(mockRepo.remove).not.toHaveBeenCalled();
    });
  });
});
