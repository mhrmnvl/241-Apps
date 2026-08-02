import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ITeacherRepository } from '../domain/interfaces/teacher-repository.interface.js';
import { GetTeacherByIdUseCase } from './get-teacher-by-id.use-case.js';

describe('GetTeacherByIdUseCase', () => {
  let useCase: GetTeacherByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTeacherByIdUseCase,
        { provide: ITeacherRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetTeacherByIdUseCase>(GetTeacherByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'emp-1';

    it('should return an teacher when found', async () => {
      const mockTeacher = {
        id: 'emp-1',
        user: { id: 'u-1', identifier: 'guru001', role: 'TEACHER' },
        profile: { id: 'p-1', name: 'Budi Santoso', nik: '3578010101700001' },
      };
      mockRepository.findById.mockResolvedValue(mockTeacher);

      const result = await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockTeacher);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
    });
  });
});
