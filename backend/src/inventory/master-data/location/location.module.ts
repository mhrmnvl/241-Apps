import { Module } from '@nestjs/common';
import { LocationController } from './presentation/location.controller.js';
import { LocationRepository } from './infrastructure/persistence/prisma-location.repository.js';
import { ILocationRepository } from './domain/interfaces/location-repository.interface.js';
import { CreateLocationUseCase } from './use-cases/create-location.use-case.js';
import { DeleteLocationUseCase } from './use-cases/delete-location.use-case.js';
import { GetLocationsUseCase } from './use-cases/get-locations.use-case.js';
import { UpdateLocationUseCase } from './use-cases/update-location.use-case.js';

@Module({
  controllers: [LocationController],
  providers: [
    { provide: ILocationRepository, useClass: LocationRepository },
    GetLocationsUseCase,
    CreateLocationUseCase,
    UpdateLocationUseCase,
    DeleteLocationUseCase,
  ],
  exports: [ILocationRepository],
})
export class LocationModule {}
