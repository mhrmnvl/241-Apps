import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateParentDto } from '../dto/create-parent.dto.js';
import { ParentRepository } from '../repositories/parent.repository.js';
import { CreateParentUseCase } from './create-parent.use-case.js';

describe('CreateParentUseCase', () => {
  let useCase: CreateParentUseCase;

  const mockRepo = {
    findByNik: jest.fn(),
    findOccupationById: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateParentUseCase,
        { provide: ParentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateParentUseCase>(CreateParentUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const dto: CreateParentDto = {
      name: 'Budi Santoso',
      nik: '3578010101700001',
      birthPlace: 'Surabaya',
      birthDate: '1970-01-01',
      occupationId: '550e8400-e29b-41d4-a716-446655440012',
    };

    const activeOccupation = {
      id: '550e8400-e29b-41d4-a716-446655440012',
      name: 'Wiraswasta',
      isActive: true,
    };

    it('should create a parent successfully', async () => {
      const mockParent = { id: 'par-1', ...dto };
      mockRepo.findByNik.mockResolvedValue(null);
      mockRepo.findOccupationById.mockResolvedValue(activeOccupation);
      mockRepo.create.mockResolvedValue(mockParent);

      const result = await useCase.execute(dto);

      expect(mockRepo.findByNik).toHaveBeenCalledWith(dto.nik);
      expect(mockRepo.findOccupationById).toHaveBeenCalledWith(
        dto.occupationId,
      );
      expect(mockRepo.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockParent);
    });

    it('should throw ConflictException when NIK is already registered', async () => {
      mockRepo.findByNik.mockResolvedValue({ id: 'par-existing' });
      mockRepo.findOccupationById.mockResolvedValue(activeOccupation);

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when occupation is not found', async () => {
      mockRepo.findByNik.mockResolvedValue(null);
      mockRepo.findOccupationById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when occupation is inactive', async () => {
      mockRepo.findByNik.mockResolvedValue(null);
      mockRepo.findOccupationById.mockResolvedValue({
        ...activeOccupation,
        isActive: false,
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
