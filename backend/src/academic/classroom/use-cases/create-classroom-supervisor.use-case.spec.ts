import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateClassroomSupervisorDto } from '../dto/request/create-classroom-supervisor.dto.js';
import { IClassroomSupervisorRepository } from '../domain/interfaces/classroom-supervisor-repository.interface.js';
import { CreateClassroomSupervisorUseCase } from './create-classroom-supervisor.use-case.js';

describe('CreateClassroomSupervisorUseCase', () => {
  let useCase: CreateClassroomSupervisorUseCase;

  const mockRepo: Partial<
    Record<keyof IClassroomSupervisorRepository, jest.Mock>
  > = {
    findTeacherById: jest.fn(),
    findAssignment: jest.fn(),
    create: jest.fn(),
  };

  const mockTeacher = { id: 'teacher-uuid-1' };

  const dto: CreateClassroomSupervisorDto = {
    classroomId: 'class-uuid-1',
    teacherId: 'teacher-uuid-1',
    semesterId: 'semester-uuid-1',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateClassroomSupervisorUseCase,
        { provide: IClassroomSupervisorRepository, useValue: mockRepo },
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
      mockRepo.findTeacherById!.mockResolvedValue(mockTeacher);
      mockRepo.findAssignment!.mockResolvedValue(null);
      mockRepo.create!.mockResolvedValue(mockSupervisor);

      const result = await useCase.execute(dto);

      expect(mockRepo.findTeacherById).toHaveBeenCalledWith(dto.teacherId);
      expect(mockRepo.findAssignment).toHaveBeenCalledWith(
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

    it('should throw NotFoundException when teacher not found', async () => {
      mockRepo.findTeacherById!.mockResolvedValue(null);
      mockRepo.findAssignment!.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });

    it('should throw ConflictException when the classroom already has a supervisor for the semester', async () => {
      mockRepo.findTeacherById!.mockResolvedValue(mockTeacher);
      mockRepo.findAssignment!.mockResolvedValue({ id: 'existing-uuid' });

      await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
      expect(mockRepo.create).not.toHaveBeenCalled();
    });
  });
});
