import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { StudentRepository } from '../index.js';
import { UpdateStudentProfileUseCase } from './update-student-profile.use-case.js';

describe('UpdateStudentProfileUseCase', () => {
  let useCase: UpdateStudentProfileUseCase;

  const mockRepo = {
    findById: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateStudentProfileUseCase,
        { provide: StudentRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateStudentProfileUseCase>(
      UpdateStudentProfileUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'stu-1';

    it('should update student profile successfully', async () => {
      const dto: UpdateProfileDto = { name: 'Ahmad Updated' };
      const updated = { id: 'prof-1', name: 'Ahmad Updated' };
      mockRepo.findById.mockResolvedValue({ id: 'stu-1' });
      mockRepo.updateProfile.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findById).toHaveBeenCalledWith(id);
      expect(mockRepo.updateProfile).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when student is not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, {})).rejects.toThrow(NotFoundException);
      expect(mockRepo.updateProfile).not.toHaveBeenCalled();
    });
  });
});
