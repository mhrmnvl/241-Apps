import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IEventRepository } from '../domain/interfaces/events-repository.interface.js';
import { DeleteEventUseCase } from './delete-event.use-case.js';

describe('DeleteEventUseCase', () => {
  let useCase: DeleteEventUseCase;
  let mockRepository: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockRepository = {
      findById: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteEventUseCase,
        { provide: IEventRepository, useValue: mockRepository },
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
