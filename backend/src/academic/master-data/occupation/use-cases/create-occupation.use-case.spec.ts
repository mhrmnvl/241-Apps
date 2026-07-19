import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateOccupationDto } from '../dto/create-occupation.dto.js';
import { IOccupationRepository } from '../interfaces/occupation-repository.interface.js';
import { CreateOccupationUseCase } from './create-occupation.use-case.js';

describe('CreateOccupationUseCase', () => {
  let useCase: CreateOccupationUseCase;

  const mockRepo = {
    findByName: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateOccupationUseCase,
        { provide: IOccupationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateOccupationUseCase>(CreateOccupationUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateOccupationDto = { name: 'Wiraswasta', isActive: true };
    const mockOccupation = { id: 'occ-1', name: 'Wiraswasta', isActive: true };

    it('should create an occupation successfully', async () => {
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockOccupation);

      const result = await useCase.execute(dto);

      expect(mockRepo.findByName).toHaveBeenCalledWith(dto.name);
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockOccupation);
    });

    it('should throw ConflictException when occupation name already exists', async () => {
      mockRepo.findByName.mockResolvedValue({ id: 'occ-existing' });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
