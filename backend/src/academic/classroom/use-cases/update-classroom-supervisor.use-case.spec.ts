import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UpdateClassroomSupervisorDto } from '../dto/update-classroom-supervisor.dto.js';
import { ClassroomSupervisorsRepository } from '../repositories/classroom-supervisors.repository.js';
import { UpdateClassroomSupervisorUseCase } from './update-classroom-supervisor.use-case.js';

describe('UpdateClassroomSupervisorUseCase', () => {
  let useCase: UpdateClassroomSupervisorUseCase;

  const mockRepo = {
    findById: jest.fn(),
    findClassroomById: jest.fn(),
    findTeacherById: jest.fn(),
    findSemesterById: jest.fn(),
    findByClassroomAndSemester: jest.fn(),
    update: jest.fn(),
  };

  const mockExisting = {
    id: 'sup-uuid-1',
    classroomId: 'class-uuid-1',
    teacherId: 'teacher-uuid-1',
    semesterId: 'semester-uuid-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateClassroomSupervisorUseCase,
        { provide: ClassroomSupervisorsRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<UpdateClassroomSupervisorUseCase>(
      UpdateClassroomSupervisorUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'sup-uuid-1';

    it('should update teacher without validating class or semester when unchanged', async () => {
      const dto: UpdateClassroomSupervisorDto = {
        teacherId: 'teacher-uuid-2',
      };
      const updated = { ...mockExisting, teacherId: 'teacher-uuid-2' };

      mockRepo.findById.mockResolvedValue(mockExisting);
      mockRepo.findTeacherById.mockResolvedValue({ id: 'teacher-uuid-2' });
      mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
      mockRepo.update.mockResolvedValue(updated);

      const result = await useCase.execute(id, dto);

      expect(mockRepo.findClassroomById).not.toHaveBeenCalled();
      expect(mockRepo.findSemesterById).not.toHaveBeenCalled();
      expect(mockRepo.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updated);
    });

    it('should throw NotFoundException when supervisor not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, {})).rejects.toThrow(NotFoundException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when new class does not exist', async () => {
      mockRepo.findById.mockResolvedValue(mockExisting);
      mockRepo.findClassroomById.mockResolvedValue(null);

      await expect(
        useCase.execute(id, { classroomId: 'class-new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when new semester does not exist', async () => {
      mockRepo.findById.mockResolvedValue(mockExisting);
      mockRepo.findSemesterById.mockResolvedValue(null);

      await expect(
        useCase.execute(id, { semesterId: 'semester-new' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when class+semester pair already has a supervisor', async () => {
      const dto: UpdateClassroomSupervisorDto = {
        semesterId: 'semester-uuid-2',
      };

      mockRepo.findById.mockResolvedValue(mockExisting);
      mockRepo.findSemesterById.mockResolvedValue({ id: 'semester-uuid-2' });
      mockRepo.findByClassroomAndSemester.mockResolvedValue({
        id: 'other-sup',
      });

      await expect(useCase.execute(id, dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.update).not.toHaveBeenCalled();
    });
  });
});
