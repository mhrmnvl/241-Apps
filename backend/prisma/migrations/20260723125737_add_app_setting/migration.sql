-- CreateEnum
CREATE TYPE "AppKey" AS ENUM ('ACADEMIC', 'INVENTORY', 'ADMISSION');

-- CreateTable
CREATE TABLE "app_settings" (
    "id" UUID NOT NULL,
    "app_key" "AppKey" NOT NULL,
    "app_title" VARCHAR(150) NOT NULL,
    "app_subtitle" VARCHAR(255) NOT NULL,
    "login_title" VARCHAR(150) NOT NULL,
    "meta_description" VARCHAR(500) NOT NULL,
    "logo_file_id" UUID,
    "favicon_file_id" UUID,
    "contact_email" VARCHAR(255),
    "contact_phone" VARCHAR(20),
    "footer_text" VARCHAR(500),
    "maintenance_mode" BOOLEAN NOT NULL DEFAULT false,
    "maintenance_message" VARCHAR(500),
    "hidden_menu_keys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updated_by" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "app_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "app_settings_app_key_key" ON "app_settings"("app_key");

-- AddForeignKey
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_logo_file_id_fkey" FOREIGN KEY ("logo_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_favicon_file_id_fkey" FOREIGN KEY ("favicon_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "app_settings" ADD CONSTRAINT "app_settings_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
