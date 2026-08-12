-- AlterEnum
-- Adds the AppKey for presence-web, the frontend that owns the gate presence
-- and payroll surfaces after they were split out of academic-web. The value is
-- only added here; the AppSetting row itself is created by the seed, or
-- self-healed on first read by GetAppSettingUseCase.
ALTER TYPE "AppKey" ADD VALUE 'PRESENCE';
