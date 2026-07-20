import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateStudentParentDto } from '../dto/request/update-student-parent.dto.js';
import { StudentParentRepository } from '../repositories/student-parent.repository.js';
import { UpdateStudentParentUseCase } from './update-student-parent.use-case.js';

describe('UpdateStudentParentUseCase', () => {
  let useCase: UpdateStudentParentUseCase;

  const mockStudentParentsRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStudentParentUseCase,
        {
          provide: StudentParentRepository,
          useValue: mockStudentParentsRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateStudentParentUseCase>(
      UpdateStudentParentUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should update entity successfully', async () => {
      const dto: UpdateStudentParentDto = { isPrimary: true };
      mockStudentParentsRepository.findById.mockResolvedValue({ id: '1' });
      mockStudentParentsRepository.update.mockResolvedValue({
        id: '1',
        isPrimary: true,
      });

      const result = await useCase.execute('1', dto);

      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when entity not found', async () => {
      mockStudentParentsRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute('nonexistent', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
