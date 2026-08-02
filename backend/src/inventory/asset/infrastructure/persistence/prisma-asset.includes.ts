import { Prisma } from '@prisma/client';

export const ASSET_WITH_DETAILS_INCLUDE = {
  category: true,
  fundingSource: true,
  units: {
    where: { deletedAt: null },
    include: {
      condition: true,
      status: true,
      location: true,
    },
  },
  _count: {
    select: {
      units: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.InventoryAssetInclude;

export type AssetWithDetails = Prisma.InventoryAssetGetPayload<{
  include: typeof ASSET_WITH_DETAILS_INCLUDE;
}>;

export const ASSET_UNIT_WITH_DETAILS_INCLUDE = {
  asset: {
    include: {
      category: true,
      fundingSource: true,
    },
  },
  condition: true,
  status: true,
  location: true,
} satisfies Prisma.InventoryAssetUnitInclude;

export type AssetUnitWithDetails = Prisma.InventoryAssetUnitGetPayload<{
  include: typeof ASSET_UNIT_WITH_DETAILS_INCLUDE;
}>;
