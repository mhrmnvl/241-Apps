import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateEducationDto } from '../dto/request/create-education.dto.js';
import { IEducationRepository } from '../interfaces/education-repository.interface.js';
import { CreateEducationUseCase } from './create-education.use-case.js';

describe('CreateEducationUseCase', () => {
  let useCase: CreateEducationUseCase;

  const mockRepository = {
    findByName: jest.fn(),
    create: jest.fn(),
  };

  const dto: CreateEducationDto = {
    name: 'S1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEducationUseCase,
        { provide: IEducationRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateEducationUseCase>(CreateEducationUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockEducation = { id: 'edu-uuid-1', name: 'S1', isActive: true };

    it('should create an education level successfully', async () => {
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue(mockEducation);

      const result = await useCase.execute(dto);

      expect(mockRepository.findByName).toHaveBeenCalledWith(dto.name);
      expect(mockRepository.create).toHaveBeenCalledWith({
        name: dto.name,
        isActive: undefined,
      });
      expect(result).toEqual(mockEducation);
    });

    it('should throw ConflictException when education name already exists', async () => {
      mockRepository.findByName.mockResolvedValue({
        id: 'existing-id',
        name: 'S1',
      });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should pass isActive when provided', async () => {
      const dtoWithActive: CreateEducationDto = { ...dto, isActive: false };
      mockRepository.findByName.mockResolvedValue(null);
      mockRepository.create.mockResolvedValue({
        ...mockEducation,
        isActive: false,
      });

      await useCase.execute(dtoWithActive);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ isActive: false }),
      );
    });
  });
});
