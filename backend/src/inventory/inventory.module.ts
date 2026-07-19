import { Module } from '@nestjs/common';
import { AssetModule } from './asset/asset.module.js';
import { MasterDataModule } from './master-data/master-data.module.js';
import { CirculationModule } from './circulation/circulation.module.js';
import { ApprovalModule } from './approval/approval.module.js';

@Module({
  imports: [AssetModule, MasterDataModule, CirculationModule, ApprovalModule],
  exports: [AssetModule, MasterDataModule, CirculationModule, ApprovalModule],
})
export class InventoryModule {}
