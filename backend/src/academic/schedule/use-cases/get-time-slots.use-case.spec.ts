import { Test, TestingModule } from '@nestjs/testing';
import { ITimeSlotRepository } from '../domain/interfaces/time-slot-repository.interface.js';
import { GetTimeSlotsUseCase } from './get-time-slots.use-case.js';

describe('GetTimeSlotsUseCase', () => {
  let useCase: GetTimeSlotsUseCase;

  const mockRepo = { findAll: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTimeSlotsUseCase,
        { provide: ITimeSlotRepository, useValue: mockRepo },
      ],
    }).compile();

    useCase = module.get<GetTimeSlotsUseCase>(GetTimeSlotsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should return all time slots', async () => {
      const mockSlots = [
        {
          id: 'ts-1',
          name: 'Jam ke-1',
          startTime: '07:00',
          endTime: '07:30',
          order: 1,
        },
        {
          id: 'ts-2',
          name: 'Jam ke-2',
          startTime: '07:30',
          endTime: '08:00',
          order: 2,
        },
      ];
      mockRepo.findAll.mockResolvedValue(mockSlots);

      const result = await useCase.execute();

      expect(mockRepo.findAll).toHaveBeenCalledWith();
      expect(result).toEqual(mockSlots);
    });

    it('should return empty array when no time slots exist', async () => {
      mockRepo.findAll.mockResolvedValue([]);

      const result = await useCase.execute();

      expect(result).toEqual([]);
    });
  });
});
