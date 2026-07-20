import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { IAdmissionApplicationRepository } from '../domain/interfaces/admission-application-repository.interface.js';
import { GetApplicationsUseCase } from './get-applications.use-case.js';
import { GetApplicationByIdUseCase } from './get-application-by-id.use-case.js';
import { GetAdmissionStatsUseCase } from './get-admission-stats.use-case.js';

describe('Admission application read use-cases', () => {
  const mockRepository = {
    findAll: jest.fn(),
    findAdminDetailById: jest.fn(),
    countByNik: jest.fn(),
    findActiveDocumentTypes: jest.fn(),
    getStatusCounts: jest.fn(),
    getWavesWithAcceptedCount: jest.fn(),
  };

  let getApplications: GetApplicationsUseCase;
  let getById: GetApplicationByIdUseCase;
  let getStats: GetAdmissionStatsUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetApplicationsUseCase,
        GetApplicationByIdUseCase,
        GetAdmissionStatsUseCase,
        { provide: IAdmissionApplicationRepository, useValue: mockRepository },
      ],
    }).compile();

    getApplications = module.get(GetApplicationsUseCase);
    getById = module.get(GetApplicationByIdUseCase);
    getStats = module.get(GetAdmissionStatsUseCase);
    jest.clearAllMocks();
  });

  describe('GetApplicationsUseCase', () => {
    it('returns data with pagination meta', async () => {
      mockRepository.findAll.mockResolvedValue({
        data: [{ id: 'app1' }],
        total: 25,
        page: 2,
        limit: 10,
      });

      const result = await getApplications.execute({ page: 2, limit: 10 });

      expect(result.meta).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
      });
    });
  });

  describe('GetApplicationByIdUseCase', () => {
    it('throws NotFoundException when application is missing', async () => {
      mockRepository.findAdminDetailById.mockResolvedValue(null);
      await expect(getById.execute('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('adds duplicate-NIK count and active document types', async () => {
      mockRepository.findAdminDetailById.mockResolvedValue({
        id: 'app1',
        nik: '123',
      });
      mockRepository.countByNik.mockResolvedValue(2);
      mockRepository.findActiveDocumentTypes.mockResolvedValue([{ id: 'dt1' }]);

      const result = await getById.execute('app1');

      expect(mockRepository.countByNik).toHaveBeenCalledWith('123', 'app1');
      expect(result.duplicateNikCount).toBe(2);
      expect(result.documentTypes).toHaveLength(1);
    });

    it('skips the NIK lookup when the application has no NIK', async () => {
      mockRepository.findAdminDetailById.mockResolvedValue({
        id: 'app1',
        nik: null,
      });
      mockRepository.findActiveDocumentTypes.mockResolvedValue([]);

      const result = await getById.execute('app1');

      expect(mockRepository.countByNik).not.toHaveBeenCalled();
      expect(result.duplicateNikCount).toBe(0);
    });
  });

  describe('GetAdmissionStatsUseCase', () => {
    it('aggregates status totals and computes quota fill rate', async () => {
      mockRepository.getStatusCounts.mockResolvedValue([
        { status: 'SUBMITTED', count: 4 },
        { status: 'ACCEPTED', count: 6 },
      ]);
      mockRepository.getWavesWithAcceptedCount.mockResolvedValue([
        { id: 'w1', name: 'G1', code: 'G1', quota: 20, accepted: 5 },
      ]);

      const result = await getStats.execute();

      expect(result.total).toBe(10);
      expect(result.byStatus).toEqual({ SUBMITTED: 4, ACCEPTED: 6 });
      expect(result.waves[0].quotaFillRate).toBe(0.25);
    });
  });
});
