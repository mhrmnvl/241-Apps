import { Module } from '@nestjs/common';
import { ReligionController } from './presentation/religion.controller.js';
import { PrismaReligionRepository } from './infrastructure/persistence/prisma-religion.repository.js';
import { IReligionRepository } from './domain/interfaces/religion-repository.interface.js';
import { CreateReligionUseCase } from './use-cases/create-religion.use-case.js';
import { DeleteReligionUseCase } from './use-cases/delete-religion.use-case.js';
import { GetReligionByIdUseCase } from './use-cases/get-religion-by-id.use-case.js';
import { GetReligionsUseCase } from './use-cases/get-religions.use-case.js';
import { UpdateReligionUseCase } from './use-cases/update-religion.use-case.js';

@Module({
  controllers: [ReligionController],
  providers: [
    { provide: IReligionRepository, useClass: PrismaReligionRepository },
    GetReligionsUseCase,
    GetReligionByIdUseCase,
    CreateReligionUseCase,
    UpdateReligionUseCase,
    DeleteReligionUseCase,
  ],
  exports: [IReligionRepository],
})
export class ReligionModule {}
