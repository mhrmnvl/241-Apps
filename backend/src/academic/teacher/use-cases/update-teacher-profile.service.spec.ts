import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateProfileDto } from '../../../platform/profile/index.js';
import { TeacherRepository } from '../repositories/teacher.repository.js';
import { UpdateTeacherProfileUseCase } from './update-teacher-profile.use-case.js';

describe('UpdateTeacherProfileUseCase', () => {
  let useCase: UpdateTeacherProfileUseCase;

  const mockRepository = {
    findById: jest.fn(),
    findProfileByUserId: jest.fn(),
    updateProfile: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateTeacherProfileUseCase,
        { provide: TeacherRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<UpdateTeacherProfileUseCase>(
      UpdateTeacherProfileUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'emp-1';
    const currentTeacher = { id: 'emp-1', user: { id: 'u-1' } };

    it('should update teacher profile successfully', async () => {
      const dto: UpdateProfileDto = { name: 'Budi Revised' };
      const updatedProfile = { id: 'p-1', name: 'Budi Revised' };

      mockRepository.findById.mockResolvedValue(currentTeacher);
      mockRepository.findProfileByUserId.mockResolvedValue(null);
      mockRepository.updateProfile.mockResolvedValue(updatedProfile);

      const result = await useCase.execute(id, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.updateProfile).toHaveBeenCalledWith('u-1', dto);
      expect(result).toEqual(updatedProfile);
    });

    it('should throw NotFoundException when teacher is not found', async () => {
      const dto: UpdateProfileDto = { name: 'Budi Revised' };
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.updateProfile).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when new NIK is already registered', async () => {
      const dto: UpdateProfileDto = { nik: '9999999999999999' };
      mockRepository.findById.mockResolvedValue(currentTeacher);
      mockRepository.findProfileByUserId.mockResolvedValue({
        id: 'dup-profile',
      });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepository.updateProfile).not.toHaveBeenCalled();
    });

    it('should NOT check NIK uniqueness when nik is not in dto', async () => {
      const dto: UpdateProfileDto = { name: 'Budi Revised' };
      mockRepository.findById.mockResolvedValue(currentTeacher);
      mockRepository.updateProfile.mockResolvedValue({ id: 'p-1' });

      await useCase.execute(id, dto);

      expect(mockRepository.findProfileByUserId).not.toHaveBeenCalled();
    });
  });
});
