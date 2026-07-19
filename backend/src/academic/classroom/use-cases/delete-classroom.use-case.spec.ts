import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomRepository } from '../repositories/classroom.repository.js';
import { DeleteClassroomUseCase } from './delete-classroom.use-case.js';

describe('DeleteClassroomUseCase', () => {
  let useCase: DeleteClassroomUseCase;

  const mockRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteClassroomUseCase,
        { provide: ClassroomRepository, useValue: mockRepository },
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
      mockRepository.softDelete.mockResolvedValue(undefined);

      await useCase.execute('cls-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('cls-1');
      expect(mockRepository.softDelete).toHaveBeenCalledWith('cls-1');
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('cls-missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
