import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IEventsRepository } from '../domain/interfaces/events-repository.interface.js';
import { GetEventByIdUseCase } from './get-event-by-id.use-case.js';

describe('GetEventByIdUseCase', () => {
  let useCase: GetEventByIdUseCase;

  const mockRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEventByIdUseCase,
        { provide: IEventsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetEventByIdUseCase>(GetEventByIdUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'evt-1';

    it('should return an event when found', async () => {
      const mockEvent = {
        id: 'evt-1',
        title: 'Pekan Ilmiah Siswa',
        startTime: '2024-03-05T08:00:00Z',
        endTime: '2024-03-05T10:00:00Z',
      };
      mockRepository.findById.mockResolvedValue(mockEvent);

      const result = await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException when event is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
    });
  });
});
