import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IStudentParentRepository } from '../domain/interfaces/student-parent-repository.interface.js';
import { GetStudentParentByIdUseCase } from './get-student-parent-by-id.use-case.js';

describe('GetStudentParentByIdUseCase', () => {
  let useCase: GetStudentParentByIdUseCase;

  const mockStudentParentsRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStudentParentByIdUseCase,
        {
          provide: IStudentParentRepository,
          useValue: mockStudentParentsRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetStudentParentByIdUseCase>(
      GetStudentParentByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return entity when found', async () => {
      mockStudentParentsRepository.findById.mockResolvedValue({
        id: '1',
        name: 'Test',
      });

      const result = await useCase.execute('1');

      expect(result).toEqual({ id: '1', name: 'Test' });
    });

    it('should throw NotFoundException when not found', async () => {
      mockStudentParentsRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
