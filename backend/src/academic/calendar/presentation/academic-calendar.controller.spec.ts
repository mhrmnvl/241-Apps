import { Test, TestingModule } from '@nestjs/testing';
import { CreateAcademicCalendarDto } from '../dto/request/create-academic-calendar.dto.js';
import { UpdateAcademicCalendarDto } from '../dto/request/update-academic-calendar.dto.js';
import { CreateAcademicCalendarUseCase } from '../use-cases/create-academic-calendar.use-case.js';
import { DeleteAcademicCalendarUseCase } from '../use-cases/delete-academic-calendar.use-case.js';
import { GetAcademicCalendarByIdUseCase } from '../use-cases/get-academic-calendar-by-id.use-case.js';
import { GetAcademicCalendarsUseCase } from '../use-cases/get-academic-calendars.use-case.js';
import { UpdateAcademicCalendarUseCase } from '../use-cases/update-academic-calendar.use-case.js';
import { AcademicCalendarController } from './academic-calendar.controller.js';

describe('AcademicCalendarController', () => {
  let controller: AcademicCalendarController;

  const mockGetAll = { execute: jest.fn() };
  const mockGetById = { execute: jest.fn() };
  const mockCreate = { execute: jest.fn() };
  const mockUpdate = { execute: jest.fn() };
  const mockDelete = { execute: jest.fn() };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicCalendarController],
      providers: [
        { provide: GetAcademicCalendarsUseCase, useValue: mockGetAll },
        { provide: GetAcademicCalendarByIdUseCase, useValue: mockGetById },
        { provide: CreateAcademicCalendarUseCase, useValue: mockCreate },
        { provide: UpdateAcademicCalendarUseCase, useValue: mockUpdate },
        { provide: DeleteAcademicCalendarUseCase, useValue: mockDelete },
      ],
    }).compile();

    controller = module.get<AcademicCalendarController>(
      AcademicCalendarController,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetAcademicCalendarsUseCase', async () => {
      const query = { page: 1, limit: 10 };
      mockGetAll.execute.mockResolvedValue({ data: [] });
      const result = await controller.findAll(query);
      expect(mockGetAll.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual({ data: [] });
    });
  });

  describe('findOne', () => {
    it('should delegate to GetAcademicCalendarByIdUseCase', async () => {
      mockGetById.execute.mockResolvedValue({ id: 'ac-1' });
      const result = await controller.findOne('ac-1');
      expect(mockGetById.execute).toHaveBeenCalledWith('ac-1');
      expect(result).toEqual({ id: 'ac-1' });
    });
  });

  describe('create', () => {
    it('should delegate to CreateAcademicCalendarUseCase', async () => {
      const dto: CreateAcademicCalendarDto = {
        academicYearId: 'ay-1',
        title: 'Semester Ganjil',
        typeId: 'calendar-type-uuid',
        startDate: '2024-07-15',
        endDate: '2024-12-20',
      };
      mockCreate.execute.mockResolvedValue({ id: 'new' });
      await controller.create(dto);
      expect(mockCreate.execute).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateAcademicCalendarUseCase', async () => {
      const dto: UpdateAcademicCalendarDto = { title: 'Updated' };
      mockUpdate.execute.mockResolvedValue({ id: 'ac-1' });
      await controller.update('ac-1', dto);
      expect(mockUpdate.execute).toHaveBeenCalledWith('ac-1', dto);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteAcademicCalendarUseCase', async () => {
      mockDelete.execute.mockResolvedValue(undefined);
      await controller.remove('ac-1');
      expect(mockDelete.execute).toHaveBeenCalledWith('ac-1');
    });
  });
});
