import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ClassroomRepository } from '../../classroom/index.js';
import { CreateEventDto } from '../dto/request/create-event.dto.js';
import { IEventRepository } from '../domain/interfaces/events-repository.interface.js';
import { CreateEventUseCase } from './create-event.use-case.js';

describe('CreateEventUseCase', () => {
  let useCase: CreateEventUseCase;

  const mockRepository = {
    create: jest.fn(),
  };

  const mockClassroomRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateEventUseCase,
        { provide: IEventRepository, useValue: mockRepository },
        { provide: ClassroomRepository, useValue: mockClassroomRepository },
      ],
    }).compile();

    useCase = module.get<CreateEventUseCase>(CreateEventUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const mockEvent = {
      id: 'evt-1',
      title: 'Pekan Ilmiah Siswa',
      description: 'Kegiatan pameran karya ilmiah siswa.',
      startTime: new Date('2024-03-05T08:00:00Z'),
      endTime: new Date('2024-03-05T10:00:00Z'),
    };

    it('should create a school-wide event (no classroomIds)', async () => {
      const dto: CreateEventDto = {
        title: 'Pekan Ilmiah Siswa',
        description: 'Kegiatan pameran karya ilmiah siswa.',
        startTime: '2024-03-05T08:00:00Z',
        endTime: '2024-03-05T10:00:00Z',
      };
      mockRepository.create.mockResolvedValue(mockEvent);

      const result = await useCase.execute(dto);

      expect(mockClassroomRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockEvent);
    });

    it('should create a classroom-specific event after validating each classroom', async () => {
      const dto: CreateEventDto = {
        title: 'Pekan Ilmiah Siswa',
        description: 'Kegiatan pameran karya ilmiah siswa.',
        startTime: '2024-03-05T08:00:00Z',
        endTime: '2024-03-05T10:00:00Z',
        classroomIds: ['cls-1', 'cls-2'],
      };
      mockClassroomRepository.findById.mockResolvedValue({ id: 'cls-1' });
      mockRepository.create.mockResolvedValue({
        ...mockEvent,
        classrooms: dto.classroomIds,
      });

      const result = await useCase.execute(dto);

      expect(mockClassroomRepository.findById).toHaveBeenCalledWith('cls-1');
      expect(mockClassroomRepository.findById).toHaveBeenCalledWith('cls-2');
      expect(mockRepository.create).toHaveBeenCalledWith(dto);
      expect(result).toBeDefined();
    });

    it('should throw NotFoundException when a target classroom does not exist', async () => {
      const dto: CreateEventDto = {
        title: 'Pekan Ilmiah Siswa',
        description: 'Kegiatan pameran karya ilmiah siswa.',
        startTime: '2024-03-05T08:00:00Z',
        endTime: '2024-03-05T10:00:00Z',
        classroomIds: ['cls-nonexistent'],
      };
      mockClassroomRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.create).not.toHaveBeenCalled();
    });

    it('should NOT call findClassroomById when classroomIds is empty array', async () => {
      const dto: CreateEventDto = {
        title: 'Pekan Ilmiah Siswa',
        description: 'Kegiatan pameran karya ilmiah siswa.',
        startTime: '2024-03-05T08:00:00Z',
        endTime: '2024-03-05T10:00:00Z',
        classroomIds: [],
      };
      mockRepository.create.mockResolvedValue(mockEvent);

      await useCase.execute(dto);

      expect(mockClassroomRepository.findById).not.toHaveBeenCalled();
    });
  });
});
