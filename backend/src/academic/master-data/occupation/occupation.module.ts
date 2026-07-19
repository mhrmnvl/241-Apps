import { Module } from '@nestjs/common';
import { OccupationController } from './presentation/occupation.controller.js';
import { OccupationRepository } from './repositories/occupation.repository.js';
import { IOccupationRepository } from './interfaces/occupation-repository.interface.js';
import { CreateOccupationUseCase } from './use-cases/create-occupation.use-case.js';
import { DeleteOccupationUseCase } from './use-cases/delete-occupation.use-case.js';
import { GetOccupationByIdUseCase } from './use-cases/get-occupation-by-id.use-case.js';
import { GetOccupationsUseCase } from './use-cases/get-occupations.use-case.js';
import { UpdateOccupationUseCase } from './use-cases/update-occupation.use-case.js';

@Module({
  controllers: [OccupationController],
  providers: [
    { provide: IOccupationRepository, useClass: OccupationRepository },
    GetOccupationsUseCase,
    GetOccupationByIdUseCase,
    CreateOccupationUseCase,
    UpdateOccupationUseCase,
    DeleteOccupationUseCase,
  ],
  exports: [IOccupationRepository],
})
export class OccupationModule {}
