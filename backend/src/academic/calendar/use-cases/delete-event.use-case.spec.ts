import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IEventsRepository } from '../domain/interfaces/events-repository.interface.js';
import { DeleteEventUseCase } from './delete-event.use-case.js';

describe('DeleteEventUseCase', () => {
  let useCase: DeleteEventUseCase;

  const mockRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteEventUseCase,
        { provide: IEventsRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteEventUseCase>(DeleteEventUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'evt-1';

    it('should soft-delete an event successfully', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'evt-1',
        title: 'Pekan Ilmiah',
      });
      mockRepository.softDelete.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when event is not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
