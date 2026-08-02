import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePositionDto } from '../dto/request/create-position.dto.js';
import { IPositionRepository } from '../domain/interfaces/position-repository.interface.js';
import { CreatePositionUseCase } from './create-position.use-case.js';

describe('CreatePositionUseCase', () => {
  let useCase: CreatePositionUseCase;

  const mockRepo = {
    findByName: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePositionUseCase,
        { provide: IPositionRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreatePositionUseCase>(CreatePositionUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreatePositionDto = {
      name: 'Kepala Sekolah',
      categoryId: 'cat-management-uuid',
    };
    const mockPosition = {
      id: 'pos-1',
      name: 'Kepala Sekolah',
      categoryId: 'cat-management-uuid',
    };

    it('should create a position successfully', async () => {
      mockRepo.findByName.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockPosition);

      const result = await useCase.execute(dto);

      expect(mockRepo.findByName).toHaveBeenCalledWith(dto.name);
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockPosition);
    });

    it('should throw ConflictException when position name is already taken', async () => {
      mockRepo.findByName.mockResolvedValue({ id: 'pos-existing' });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
