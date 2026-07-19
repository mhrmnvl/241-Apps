import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementQueryDto } from '../dto/announcement-query.dto.js';
import { AnnouncementRepository } from '../repositories/announcement.repository.js';
import { GetAnnouncementsUseCase } from './get-announcements.use-case.js';

describe('GetAnnouncementsUseCase', () => {
  let useCase: GetAnnouncementsUseCase;

  const mockRepository = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetAnnouncementsUseCase,
        { provide: AnnouncementRepository, useValue: mockRepository },
      ],
    }).compile();

    useCase = module.get<GetAnnouncementsUseCase>(GetAnnouncementsUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    const query: AnnouncementQueryDto = { page: 1, limit: 10 };

    it('should return paginated announcements', async () => {
      const mockData = [
        {
          id: 'ann-1',
          title: 'Jadwal Ujian',
          date: new Date('2025-05-20'),
          classrooms: [],
        },
        {
          id: 'ann-2',
          title: 'Libur Nasional',
          date: new Date('2025-06-01'),
          classrooms: [],
        },
      ];
      mockRepository.findAll.mockResolvedValue({
        data: mockData,
        total: 2,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(mockRepository.findAll).toHaveBeenCalledWith(query);
      expect(result).toEqual({
        data: mockData,
        meta: { page: 1, limit: 10, total: 2, totalPages: 1 },
      });
    });

    it('should calculate totalPages correctly', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 21,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.meta.totalPages).toBe(3);
    });

    it('should return empty data when no announcements', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      const result = await useCase.execute(query);

      expect(result.data).toEqual([]);
      expect(result.meta.total).toBe(0);
      expect(result.meta.totalPages).toBe(0);
    });

    it('should pass classroomId filter to repository', async () => {
      const filteredQuery: AnnouncementQueryDto = {
        page: 1,
        limit: 10,
        classroomId: '550e8400-e29b-41d4-a716-446655440004',
      };
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await useCase.execute(filteredQuery);

      expect(mockRepository.findAll).toHaveBeenCalledWith(filteredQuery);
    });

    it('should pass search term to repository', async () => {
      const searchQuery: AnnouncementQueryDto = {
        page: 1,
        limit: 10,
        search: 'Ujian',
      };
      mockRepository.findAll.mockResolvedValue({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });

      await useCase.execute(searchQuery);

      expect(mockRepository.findAll).toHaveBeenCalledWith(searchQuery);
    });
  });
});
