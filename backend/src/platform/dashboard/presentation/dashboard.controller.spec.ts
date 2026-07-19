import { Test, TestingModule } from '@nestjs/testing';
import { GetDashboardSummaryUseCase } from '../use-cases/get-dashboard-summary.use-case.js';
import { DashboardController } from './dashboard.controller.js';

describe('DashboardController', () => {
  let controller: DashboardController;

  const mockGetSummary = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        { provide: GetDashboardSummaryUseCase, useValue: mockGetSummary },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getSummary', () => {
    it('should delegate to GetDashboardSummaryUseCase', async () => {
      const summary = { totalStudents: 100, totalTeachers: 20 };
      mockGetSummary.execute.mockResolvedValue(summary);

      const result = await controller.getSummary();

      expect(mockGetSummary.execute).toHaveBeenCalledWith();
      expect(result).toEqual(summary);
    });
  });
});
