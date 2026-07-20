import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IGradeRepository } from '../domain/interfaces/grade-repository.interface.js';
import { CreateGradeUseCase } from './create-grade.use-case.js';

describe('CreateGradeUseCase', () => {
  let useCase: CreateGradeUseCase;

  const mockRepository = {
    findByLevel: jest.fn(),
    findByName: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateGradeUseCase,
        { provide: IGradeRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<CreateGradeUseCase>(CreateGradeUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a classroom level', async () => {
    const dto = { level: 10, name: 'X' };
    const created = { id: 'lvl-new', ...dto, isActive: true };
    mockRepository.findByLevel.mockResolvedValue(null);
    mockRepository.findByName.mockResolvedValue(null);
    mockRepository.create.mockResolvedValue(created);

    const result = await useCase.execute(dto);

    expect(result).toEqual(created);
    expect(mockRepository.create).toHaveBeenCalledWith(dto);
  });

  it('should throw ConflictException when level already exists', async () => {
    mockRepository.findByLevel.mockResolvedValue({ id: 'lvl-existing' });

    await expect(useCase.execute({ level: 7, name: 'VII' })).rejects.toThrow(
      ConflictException,
    );
    expect(mockRepository.create).not.toHaveBeenCalled();
  });

  it('should throw ConflictException when name already exists', async () => {
    mockRepository.findByLevel.mockResolvedValue(null);
    mockRepository.findByName.mockResolvedValue({ id: 'lvl-existing' });

    await expect(useCase.execute({ level: 10, name: 'VII' })).rejects.toThrow(
      ConflictException,
    );
    expect(mockRepository.create).not.toHaveBeenCalled();
  });
});
