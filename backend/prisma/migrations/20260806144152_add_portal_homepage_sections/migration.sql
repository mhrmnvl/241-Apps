-- CreateTable
CREATE TABLE "portal_homepage_sections" (
    "id" UUID NOT NULL,
    "key" VARCHAR(40) NOT NULL,
    "item_count" INTEGER NOT NULL DEFAULT 3,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_homepage_sections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_homepage_sections_key_key" ON "portal_homepage_sections"("key");
