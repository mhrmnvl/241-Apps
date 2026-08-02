import { Module } from '@nestjs/common';
import { SchoolUnitController } from './presentation/school-unit.controller.js';
import { SchoolUnitAddressController } from './presentation/school-unit-address.controller.js';
import { SchoolUnitSocialMediaController } from './presentation/school-unit-social-media.controller.js';
import { SchoolUnitTypeController } from './presentation/school-unit-type.controller.js';
import { ISchoolUnitRepository } from './domain/interfaces/school-unit-repository.interface.js';
import { ISchoolUnitAddressRepository } from './domain/interfaces/school-unit-address-repository.interface.js';
import { ISchoolUnitSocialMediaRepository } from './domain/interfaces/school-unit-social-media-repository.interface.js';
import { ISchoolUnitTypeRepository } from './domain/interfaces/school-unit-type-repository.interface.js';
import { PrismaSchoolUnitRepository } from './infrastructure/persistence/prisma-school-unit.repository.js';
import { PrismaSchoolUnitAddressRepository } from './infrastructure/persistence/prisma-school-unit-address.repository.js';
import { PrismaSchoolUnitSocialMediaRepository } from './infrastructure/persistence/prisma-school-unit-social-media.repository.js';
import { PrismaSchoolUnitTypeRepository } from './infrastructure/persistence/prisma-school-unit-type.repository.js';
import { GetSchoolUnitUseCase } from './use-cases/get-school-unit.use-case.js';
import { SetupSchoolUnitUseCase } from './use-cases/setup-school-unit.use-case.js';
import { UpdateSchoolUnitUseCase } from './use-cases/update-school-unit.use-case.js';
import { SchoolUnitAddressUseCase } from './use-cases/school-unit-address.use-case.js';
import { SchoolUnitSocialMediaUseCase } from './use-cases/school-unit-social-media.use-case.js';
import { CreateSchoolUnitTypeUseCase } from './use-cases/create-school-unit-type.use-case.js';
import { UpdateSchoolUnitTypeUseCase } from './use-cases/update-school-unit-type.use-case.js';
import { DeleteSchoolUnitTypeUseCase } from './use-cases/delete-school-unit-type.use-case.js';
import { GetSchoolUnitTypesUseCase } from './use-cases/get-school-unit-types.use-case.js';
import { GetSchoolUnitTypeByIdUseCase } from './use-cases/get-school-unit-type-by-id.use-case.js';

@Module({
  controllers: [
    SchoolUnitController,
    SchoolUnitAddressController,
    SchoolUnitSocialMediaController,
    SchoolUnitTypeController,
  ],
  providers: [
    { provide: ISchoolUnitRepository, useClass: PrismaSchoolUnitRepository },
    {
      provide: ISchoolUnitAddressRepository,
      useClass: PrismaSchoolUnitAddressRepository,
    },
    {
      provide: ISchoolUnitSocialMediaRepository,
      useClass: PrismaSchoolUnitSocialMediaRepository,
    },
    {
      provide: ISchoolUnitTypeRepository,
      useClass: PrismaSchoolUnitTypeRepository,
    },
    GetSchoolUnitUseCase,
    SetupSchoolUnitUseCase,
    UpdateSchoolUnitUseCase,
    SchoolUnitAddressUseCase,
    SchoolUnitSocialMediaUseCase,
    CreateSchoolUnitTypeUseCase,
    UpdateSchoolUnitTypeUseCase,
    DeleteSchoolUnitTypeUseCase,
    GetSchoolUnitTypesUseCase,
    GetSchoolUnitTypeByIdUseCase,
  ],
  exports: [
    ISchoolUnitRepository,
    ISchoolUnitAddressRepository,
    ISchoolUnitSocialMediaRepository,
    ISchoolUnitTypeRepository,
    GetSchoolUnitUseCase,
  ],
})
export class SchoolUnitModule {}
