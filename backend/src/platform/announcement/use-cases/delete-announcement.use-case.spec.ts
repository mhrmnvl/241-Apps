import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementRepository } from '../repositories/announcement.repository.js';
import { DeleteAnnouncementUseCase } from './delete-announcement.use-case.js';

describe('DeleteAnnouncementUseCase', () => {
  let useCase: DeleteAnnouncementUseCase;

  const mockRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAnnouncementUseCase,
        { provide: AnnouncementRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<DeleteAnnouncementUseCase>(DeleteAnnouncementUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const id = 'ann-1';

    it('should soft-delete an announcement successfully', async () => {
      mockRepository.findById.mockResolvedValue({
        id: 'ann-1',
        title: 'Jadwal Ujian Akhir Semester',
      });
      mockRepository.softDelete.mockResolvedValue(undefined);

      await useCase.execute(id);

      expect(mockRepository.findById).toHaveBeenCalledWith(id);
      expect(mockRepository.softDelete).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException when ID not found', async () => {
      mockRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(id)).rejects.toThrow(NotFoundException);
      expect(mockRepository.softDelete).not.toHaveBeenCalled();
    });
  });
});
