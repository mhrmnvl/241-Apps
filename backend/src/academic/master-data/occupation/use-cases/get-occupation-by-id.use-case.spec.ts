import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IOccupationRepository } from '../interfaces/occupation-repository.interface.js';
import { GetOccupationByIdUseCase } from './get-occupation-by-id.use-case.js';

describe('GetOccupationByIdUseCase', () => {
  let useCase: GetOccupationByIdUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetOccupationByIdUseCase,
        { provide: IOccupationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetOccupationByIdUseCase>(GetOccupationByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'occ-1';

    it('should return an occupation when found', async () => {
      const mockOccupation = { id: 'occ-1', name: 'Wiraswasta' };
      mockRepo.findById.mockResolvedValue(mockOccupation);

      const result = await useCase.execute(id);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockOccupation);
    });

    it('should throw NotFoundException when occupation is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
    });
  });
});
