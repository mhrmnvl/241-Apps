import { Module } from '@nestjs/common';
import { FileModule } from '../file/file.module.js';
import { ProfileController } from './presentation/profile.controller.js';
import { ProfileAddressController } from './presentation/profile-address.controller.js';
import { ProfileSocialMediaController } from './presentation/profile-social-media.controller.js';
import { IProfileRepository } from './domain/interfaces/profile-repository.interface.js';
import { IProfileAddressRepository } from './domain/interfaces/profile-address-repository.interface.js';
import { IProfileSocialMediaRepository } from './domain/interfaces/profile-social-media-repository.interface.js';
import { PrismaProfileRepository } from './infrastructure/persistence/prisma-profile.repository.js';
import { PrismaProfileAddressRepository } from './infrastructure/persistence/prisma-profile-address.repository.js';
import { PrismaProfileSocialMediaRepository } from './infrastructure/persistence/prisma-profile-social-media.repository.js';
import { GetProfileUseCase } from './use-cases/get-profile.use-case.js';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case.js';
import { UploadProfilePhotoUseCase } from './use-cases/upload-profile-photo.use-case.js';
import { DeleteProfilePhotoUseCase } from './use-cases/delete-profile-photo.use-case.js';
import { AddProfileAddressUseCase } from './use-cases/add-profile-address.use-case.js';
import { GetProfileAddressesUseCase } from './use-cases/get-profile-addresses.use-case.js';
import { UpdateProfileAddressUseCase } from './use-cases/update-profile-address.use-case.js';
import { RemoveProfileAddressUseCase } from './use-cases/remove-profile-address.use-case.js';
import { AddProfileSocialMediaUseCase } from './use-cases/add-profile-social-media.use-case.js';
import { GetAllProfileSocialMediasUseCase } from './use-cases/get-all-profile-social-medias.use-case.js';
import { GetProfileSocialMediasUseCase } from './use-cases/get-profile-social-medias.use-case.js';
import { UpdateProfileSocialMediaUseCase } from './use-cases/update-profile-social-media.use-case.js';
import { RemoveProfileSocialMediaUseCase } from './use-cases/remove-profile-social-media.use-case.js';

@Module({
  imports: [FileModule],
  controllers: [
    ProfileController,
    ProfileAddressController,
    ProfileSocialMediaController,
  ],
  providers: [
    { provide: IProfileRepository, useClass: PrismaProfileRepository },
    {
      provide: IProfileAddressRepository,
      useClass: PrismaProfileAddressRepository,
    },
    {
      provide: IProfileSocialMediaRepository,
      useClass: PrismaProfileSocialMediaRepository,
    },
    GetProfileUseCase,
    UpdateProfileUseCase,
    UploadProfilePhotoUseCase,
    DeleteProfilePhotoUseCase,
    AddProfileAddressUseCase,
    GetProfileAddressesUseCase,
    UpdateProfileAddressUseCase,
    RemoveProfileAddressUseCase,
    AddProfileSocialMediaUseCase,
    GetAllProfileSocialMediasUseCase,
    GetProfileSocialMediasUseCase,
    UpdateProfileSocialMediaUseCase,
    RemoveProfileSocialMediaUseCase,
  ],
  exports: [
    IProfileRepository,
    IProfileAddressRepository,
    IProfileSocialMediaRepository,
  ],
})
export class ProfileModule {}
