import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomSupervisorsRepository } from '../repositories/classroom-supervisors.repository.js';
import { GetClassroomSupervisorByIdUseCase } from './get-classroom-supervisor-by-id.use-case.js';

describe('GetClassroomSupervisorByIdUseCase', () => {
  let useCase: GetClassroomSupervisorByIdUseCase;

  const mockRepo = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetClassroomSupervisorByIdUseCase,
        { provide: ClassroomSupervisorsRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetClassroomSupervisorByIdUseCase>(
      GetClassroomSupervisorByIdUseCase,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return the supervisor when found', async () => {
      const mockSupervisor = {
        id: 'sup-uuid-1',
        classroomId: 'c1',
        teacherId: 'e1',
        semesterId: 'sem1',
      };
      mockRepo.findById.mockResolvedValue(mockSupervisor);

      const result = await useCase.execute('sup-uuid-1');

      expect(mockRepo.findById).toHaveBeenCalledWith('sup-uuid-1');
      expect(result).toEqual(mockSupervisor);
    });

    it('should throw NotFoundException when not found', async () => {
      mockRepo.findById.mockResolvedValue(null);

      await expect(useCase.execute('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
