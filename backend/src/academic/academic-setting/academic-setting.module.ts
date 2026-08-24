import { Module } from '@nestjs/common';
import { AcademicSettingController } from './presentation/academic-setting.controller.js';
import { IAcademicSettingRepository } from './domain/interfaces/academic-setting-repository.interface.js';
import { PrismaAcademicSettingRepository } from './infrastructure/persistence/prisma-academic-setting.repository.js';
import { GetAcademicSettingUseCase } from './use-cases/get-academic-setting.use-case.js';
import { UpdateAcademicSettingUseCase } from './use-cases/update-academic-setting.use-case.js';

@Module({
  controllers: [AcademicSettingController],
  providers: [
    {
      provide: IAcademicSettingRepository,
      useClass: PrismaAcademicSettingRepository,
    },
    GetAcademicSettingUseCase,
    UpdateAcademicSettingUseCase,
  ],
  // Exported so the calendar can read the teaching week without another HTTP
  // hop once it starts marking those days.
  exports: [IAcademicSettingRepository],
})
export class AcademicSettingModule {}
