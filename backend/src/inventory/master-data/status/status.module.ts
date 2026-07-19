import { Module } from '@nestjs/common';
import { StatusController } from './presentation/status.controller.js';
import { StatusRepository } from './infrastructure/persistence/prisma-status.repository.js';
import { IStatusRepository } from './domain/interfaces/status-repository.interface.js';
import { CreateStatusUseCase } from './use-cases/create-status.use-case.js';
import { DeleteStatusUseCase } from './use-cases/delete-status.use-case.js';
import { GetStatusesUseCase } from './use-cases/get-statuses.use-case.js';
import { UpdateStatusUseCase } from './use-cases/update-status.use-case.js';

@Module({
  controllers: [StatusController],
  providers: [
    { provide: IStatusRepository, useClass: StatusRepository },
    GetStatusesUseCase,
    CreateStatusUseCase,
    UpdateStatusUseCase,
    DeleteStatusUseCase,
  ],
  exports: [IStatusRepository],
})
export class StatusModule {}
