import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IGraduationRepository } from '../domain/interfaces/graduation-repository.interface.js';
import { UpdateStudentGraduationUseCase } from './update-student-graduation.use-case.js';

describe('UpdateStudentGraduationUseCase', () => {
  let useCase: UpdateStudentGraduationUseCase;

  const mockRepo = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStudentGraduationUseCase,
        { provide: IGraduationRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateStudentGraduationUseCase>(
      UpdateStudentGraduationUseCase,
    );
    jest.clearAllMocks();
  });

  it('should update graduation successfully', async () => {
    mockRepo.findById.mockResolvedValue({ id: 'grad-1' });
    mockRepo.update.mockResolvedValue({ id: 'grad-1', certificateNo: 'DN-01' });

    const result = await useCase.execute('grad-1', {
      certificateNo: 'DN-01',
    });
    expect(result.certificateNo).toBe('DN-01');
  });

  it('should throw NotFoundException when not found', async () => {
    mockRepo.findById.mockResolvedValue(null);
    await expect(
      useCase.execute('grad-1', { certificateNo: 'DN-01' }),
    ).rejects.toThrow(NotFoundException);
  });
});
