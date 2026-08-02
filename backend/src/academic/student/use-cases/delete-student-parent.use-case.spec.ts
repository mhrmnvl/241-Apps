import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IStudentParentRepository } from '../domain/interfaces/student-parent-repository.interface.js';
import { DeleteStudentParentUseCase } from './delete-student-parent.use-case.js';

describe('DeleteStudentParentUseCase', () => {
  let useCase: DeleteStudentParentUseCase;

  const mockStudentParentsRepository = {
    findById: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteStudentParentUseCase,
        {
          provide: IStudentParentRepository,
          useValue: mockStudentParentsRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteStudentParentUseCase>(
      DeleteStudentParentUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should delete entity when found', async () => {
      mockStudentParentsRepository.findById.mockResolvedValue({ id: '1' });
      mockStudentParentsRepository.remove.mockResolvedValue({});

      await useCase.execute('1');

      expect(mockStudentParentsRepository.remove).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when entity not found', async () => {
      mockStudentParentsRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
