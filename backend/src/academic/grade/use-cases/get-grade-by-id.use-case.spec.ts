import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IClassroomLevelsRepository } from '../domain/interfaces/classroom-levels-repository.interface.js';
import { GetClassroomLevelByIdUseCase } from './get-grade-by-id.use-case.js';

describe('GetClassroomLevelByIdUseCase', () => {
  let useCase: GetClassroomLevelByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClassroomLevelByIdUseCase,
        { provide: IClassroomLevelsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetClassroomLevelByIdUseCase>(
      GetClassroomLevelByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return classroom level when found', async () => {
    const level = { id: 'lvl-1', level: 7, name: 'VII', isActive: true };
    mockRepository.findById.mockResolvedValue(level);

    const result = await useCase.execute('lvl-1');

    expect(result).toEqual(level);
  });

  it('should throw NotFoundException when not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('lvl-missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
