import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IClassroomRepository } from '../../classroom/index.js';
import { UpdateEventDto } from '../dto/request/update-event.dto.js';
import { IEventRepository } from '../domain/interfaces/event-repository.interface.js';
import { UpdateEventUseCase } from './update-event.use-case.js';

describe('UpdateEventUseCase', () => {
  let useCase: UpdateEventUseCase;

  const mockRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  const mockClassroomRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateEventUseCase,
        { provide: IEventRepository, useValue: mockRepository },
        { provide: IClassroomRepository, useValue: mockClassroomRepository },
      ],
    }).compile();

    useCase = module.get<UpdateEventUseCase>(UpdateEventUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'evt-1';
    const currentEvent = {
      id: 'evt-1',
      title: 'Pekan Ilmiah Siswa',
      startTime: '2024-03-05T08:00:00Z',
      endTime: '2024-03-05T10:00:00Z',
    };

    it('should update an event successfully (no classroomIds)', async () => {
      const dto: UpdateEventDto = { title: 'Pekan Ilmiah Siswa 2024' };
      const updatedEvent = {
        ...currentEvent,
        title: 'Pekan Ilmiah Siswa 2024',
      };

      mockRepository.findById.mockResolvedValue(currentEvent);
      mockRepository.update.mockResolvedValue(updatedEvent);

      const result = await useCase.execute(id, dto);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockClassroomRepository.findById).not.toHaveBeenCalled();
      expect(mockRepository.update).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(updatedEvent);
    });

    it('should validate each classroomId when updating with classroomIds', async () => {
      const dto: UpdateEventDto = { classroomIds: ['cls-1', 'cls-2'] };

      mockRepository.findById.mockResolvedValue(currentEvent);
      mockClassroomRepository.findById.mockResolvedValue({ id: 'cls-1' });
      mockRepository.update.mockResolvedValue(currentEvent);

      await useCase.execute(id, dto);

      expect(mockClassroomRepository.findById).toHaveBeenCalledWith('cls-1');
      expect(mockClassroomRepository.findById).toHaveBeenCalledWith('cls-2');
    });

    it('should throw NotFoundException when event is not found', async () => {
      const dto: UpdateEventDto = { title: 'Updated' };
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when a target classroom does not exist', async () => {
      const dto: UpdateEventDto = { classroomIds: ['cls-nonexistent'] };

      mockRepository.findById.mockResolvedValue(currentEvent);
      mockClassroomRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id, dto)).rejects.toThrow(NotFoundException);
      expect(mockRepository.update).not.toHaveBeenCalled();
    });

    it('should NOT call findClassroomById when classroomIds is not in dto', async () => {
      const dto: UpdateEventDto = { title: 'Updated Title' };

      mockRepository.findById.mockResolvedValue(currentEvent);
      mockRepository.update.mockResolvedValue(currentEvent);

      await useCase.execute(id, dto);

      expect(mockClassroomRepository.findById).not.toHaveBeenCalled();
    });
  });
});
