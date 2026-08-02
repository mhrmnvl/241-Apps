import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IClassroomRepository } from '../domain/interfaces/classroom-repository.interface.js';
import { GetClassroomByIdUseCase } from './get-classroom-by-id.use-case.js';

describe('GetClassroomByIdUseCase', () => {
  let useCase: GetClassroomByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClassroomByIdUseCase,
        { provide: IClassroomRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetClassroomByIdUseCase>(GetClassroomByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return classroom when found', async () => {
      const classroom = {
        id: 'cls-1',
        code: 'VII-A',
        name: 'Kelas VII A',
        gradeId: 'lvl-7',
      };
      mockRepository.findById.mockResolvedValue(classroom);

      const result = await useCase.execute('cls-1');

      expect(mockRepository.findById).toHaveBeenCalledWith('cls-1');
      expect(result).toEqual({ ...classroom, displayName: classroom.name });
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('cls-missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
