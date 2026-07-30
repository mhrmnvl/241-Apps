import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateClassroomSupervisorDto } from '../dto/request/create-classroom-supervisor.dto.js';
import { ClassroomSupervisorRepository } from '../repositories/classroom-supervisors.repository.js';
import { CreateClassroomSupervisorUseCase } from './create-classroom-supervisor.use-case.js';

describe('CreateClassroomSupervisorUseCase', () => {
  let useCase: CreateClassroomSupervisorUseCase;

  const mockRepo = {
    findClassroomById: jest.fn(),
    findTeacherById: jest.fn(),
    findSemesterById: jest.fn(),
    findByClassroomAndSemester: jest.fn(),
    findSoftDeletedByClassroomAndSemester: jest.fn(),
    create: jest.fn(),
    restore: jest.fn(),
  };

  const mockClassroom = { id: 'class-uuid-1', name: 'A' };
  const mockTeacher = { id: 'teacher-uuid-1' };
  const mockSemester = { id: 'semester-uuid-1', type: 'ODD' };

  const dto: CreateClassroomSupervisorDto = {
    classroomId: 'class-uuid-1',
    teacherId: 'teacher-uuid-1',
    semesterId: 'semester-uuid-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClassroomSupervisorUseCase,
        { provide: ClassroomSupervisorRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<CreateClassroomSupervisorUseCase>(
      CreateClassroomSupervisorUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockSupervisor = { id: 'supervisor-uuid-1', ...dto };

    it('should create class supervisor successfully', async () => {
      mockRepo.findClassroomById.mockResolvedValue(mockClassroom);
      mockRepo.findTeacherById.mockResolvedValue(mockTeacher);
      mockRepo.findSemesterById.mockResolvedValue(mockSemester);
      mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
      mockRepo.findSoftDeletedByClassroomAndSemester.mockResolvedValue(null);
      mockRepo.create.mockResolvedValue(mockSupervisor);

      const result = await useCase.execute(dto);

      expect(mockRepo.findClassroomById).toHaveBeenCalledWith(dto.classroomId);
      expect(mockRepo.findTeacherById).toHaveBeenCalledWith(dto.teacherId);
      expect(mockRepo.findSemesterById).toHaveBeenCalledWith(dto.semesterId);
      expect(mockRepo.findByClassroomAndSemester).toHaveBeenCalledWith(
        dto.classroomId,
        dto.semesterId,
      );
      expect(mockRepo.create).toHaveBeenCalledWith({
        classroomId: dto.classroomId,
        teacherId: dto.teacherId,
        semesterId: dto.semesterId,
      });
      expect(result).toEqual(mockSupervisor);
    });

    it('should restore soft-deleted supervisor instead of creating new one', async () => {
      const softDeletedRecord = {
        id: 'soft-deleted-uuid',
        classroomId: dto.classroomId,
        teacherId: 'old-teacher-uuid',
        semesterId: dto.semesterId,
        deletedAt: new Date(),
      };
      const restoredRecord = {
        id: 'soft-deleted-uuid',
        classroomId: dto.classroomId,
        teacherId: dto.teacherId,
        semesterId: dto.semesterId,
        deletedAt: null,
      };

      mockRepo.findClassroomById.mockResolvedValue(mockClassroom);
      mockRepo.findTeacherById.mockResolvedValue(mockTeacher);
      mockRepo.findSemesterById.mockResolvedValue(mockSemester);
      mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
      mockRepo.findSoftDeletedByClassroomAndSemester.mockResolvedValue(
        softDeletedRecord,
      );
      mockRepo.restore.mockResolvedValue(restoredRecord);

      const result = await useCase.execute(dto);

      expect(mockRepo.restore).toHaveBeenCalledWith(softDeletedRecord.id, {
        teacherId: dto.teacherId,
      });
      expect(mockRepo.create).not.toHaveBeenCalled();
      expect(result).toEqual(restoredRecord);
    });

    it('should throw NotFoundException when class not found', async () => {
      mockRepo.findClassroomById.mockResolvedValue(null);
      mockRepo.findTeacherById.mockResolvedValue(mockTeacher);
      mockRepo.findSemesterById.mockResolvedValue(mockSemester);
      mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
      mockRepo.findSoftDeletedByClassroomAndSemester.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when teacher not found', async () => {
      mockRepo.findClassroomById.mockResolvedValue(mockClassroom);
      mockRepo.findTeacherById.mockResolvedValue(null);
      mockRepo.findSemesterById.mockResolvedValue(mockSemester);
      mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
      mockRepo.findSoftDeletedByClassroomAndSemester.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when semester not found', async () => {
      mockRepo.findClassroomById.mockResolvedValue(mockClassroom);
      mockRepo.findTeacherById.mockResolvedValue(mockTeacher);
      mockRepo.findSemesterById.mockResolvedValue(null);
      mockRepo.findByClassroomAndSemester.mockResolvedValue(null);
      mockRepo.findSoftDeletedByClassroomAndSemester.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when class already has supervisor for this semester', async () => {
      mockRepo.findClassroomById.mockResolvedValue(mockClassroom);
      mockRepo.findTeacherById.mockResolvedValue(mockTeacher);
      mockRepo.findSemesterById.mockResolvedValue(mockSemester);
      mockRepo.findByClassroomAndSemester.mockResolvedValue({
        id: 'existing-id',
      });
      mockRepo.findSoftDeletedByClassroomAndSemester.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
