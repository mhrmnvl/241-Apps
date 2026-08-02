import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { DeleteClassroomUseCase } from './delete-classroom.use-case.js';

describe('DeleteClassroomUseCase', () => {
  let useCase: DeleteClassroomUseCase;

  const mockRepository = {
    findById: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClassroomUseCase,
        { provide: IClassroomRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteClassroomUseCase>(DeleteClassroomUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should soft-delete successfully', async () => {
      mockRepository.findById.mockResolvedValue({ id: 'cls-1' });
      mockRepository.remove.mockResolvedValue(undefined);

      await useCase.execute('cls-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('cls-1');
      expect(mockRepository.remove).toHaveBeenCalledWith('cls-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('cls-missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.remove).not.toHaveBeenCalled();
    });
  });
});
