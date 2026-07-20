import { Test, TestingModule } from '@nestjs/testing';
import { CreateEventDto } from '../dto/request/create-event.dto.js';
import { EventQueryDto } from '../dto/request/event-query.dto.js';
import { UpdateEventDto } from '../dto/request/update-event.dto.js';
import { CreateEventUseCase } from '../use-cases/create-event.use-case.js';
import { DeleteEventUseCase } from '../use-cases/delete-event.use-case.js';
import { GetEventByIdUseCase } from '../use-cases/get-event-by-id.use-case.js';
import { GetEventsUseCase } from '../use-cases/get-events.use-case.js';
import { UpdateEventUseCase } from '../use-cases/update-event.use-case.js';
import { EventsController } from './events.controller.js';
import type { AuthenticatedUser } from '../../../core/types/authenticated-user.type.js';

describe('EventsController', () => {
  let controller: EventsController;

  const mockGetEventsService = { execute: jest.fn() };
  const mockGetEventByIdService = { execute: jest.fn() };
  const mockCreateEventService = { execute: jest.fn() };
  const mockUpdateEventService = { execute: jest.fn() };
  const mockDeleteEventService = { execute: jest.fn() };

  const user: AuthenticatedUser = {
    id: 'user-uuid',
    sub: 'user-uuid',
    identifier: 'admin',
    sessionId: 'session-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        { provide: GetEventsUseCase, useValue: mockGetEventsService },
        { provide: GetEventByIdUseCase, useValue: mockGetEventByIdService },
        { provide: CreateEventUseCase, useValue: mockCreateEventService },
        { provide: UpdateEventUseCase, useValue: mockUpdateEventService },
        { provide: DeleteEventUseCase, useValue: mockDeleteEventService },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should delegate to GetEventsUseCase with query and schoolUnitId', async () => {
      const query: EventQueryDto = { page: 1, limit: 10 };
      const expected = {
        data: [{ id: 'evt-1', title: 'Pekan Ilmiah' }],
        meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
      };
      mockGetEventsService.execute.mockResolvedValue(expected);

      const result = await controller.findAll(query, user);

      expect(mockGetEventsService.execute).toHaveBeenCalledWith(query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should delegate to GetEventByIdUseCase with id and schoolUnitId', async () => {
      const id = 'evt-1';
      const expected = { id: 'evt-1', title: 'Pekan Ilmiah' };
      mockGetEventByIdService.execute.mockResolvedValue(expected);

      const result = await controller.findOne(id, user);

      expect(mockGetEventByIdService.execute).toHaveBeenCalledWith(id);
      expect(result).toEqual(expected);
    });
  });

  describe('create', () => {
    it('should delegate to CreateEventUseCase with dto and schoolUnitId', async () => {
      const dto: CreateEventDto = {
        title: 'Pekan Ilmiah',
        description: 'Kegiatan pameran karya ilmiah siswa.',
        startTime: '2024-03-05T08:00:00Z',
        endTime: '2024-03-05T10:00:00Z',
      };
      const expected = { id: 'evt-new', ...dto };
      mockCreateEventService.execute.mockResolvedValue(expected);

      const result = await controller.create(dto, user);

      expect(mockCreateEventService.execute).toHaveBeenCalledWith(dto);
      expect(result).toEqual(expected);
    });
  });

  describe('update', () => {
    it('should delegate to UpdateEventUseCase with id, dto, and schoolUnitId', async () => {
      const id = 'evt-1';
      const dto: UpdateEventDto = { title: 'Pekan Ilmiah 2024' };
      const expected = { id: 'evt-1', title: 'Pekan Ilmiah 2024' };
      mockUpdateEventService.execute.mockResolvedValue(expected);

      const result = await controller.update(id, dto, user);

      expect(mockUpdateEventService.execute).toHaveBeenCalledWith(id, dto);
      expect(result).toEqual(expected);
    });
  });

  describe('remove', () => {
    it('should delegate to DeleteEventUseCase with id and schoolUnitId', async () => {
      const id = 'evt-1';
      mockDeleteEventService.execute.mockResolvedValue(undefined);

      await controller.remove(id, user);

      expect(mockDeleteEventService.execute).toHaveBeenCalledWith(id);
    });
  });
});
