import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IClassroomLevelsRepository } from '../domain/interfaces/classroom-levels-repository.interface.js';
import { DeleteClassroomLevelUseCase } from './delete-grade.use-case.js';

describe('DeleteClassroomLevelUseCase', () => {
  let useCase: DeleteClassroomLevelUseCase;

  const mockRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClassroomLevelUseCase,
        { provide: IClassroomLevelsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteClassroomLevelUseCase>(
      DeleteClassroomLevelUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete the classroom level', async () => {
    mockRepository.findById.mockResolvedValue({ id: 'lvl-1' });
    mockRepository.softDelete.mockResolvedValue(undefined);

    await useCase.execute('lvl-1');

    expect(mockRepository.softDelete).toHaveBeenCalledWith('lvl-1');
  });

  it('should throw NotFoundException when not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('lvl-missing')).rejects.toThrow(
      NotFoundException,
    );
    expect(mockRepository.softDelete).not.toHaveBeenCalled();
  });
});
