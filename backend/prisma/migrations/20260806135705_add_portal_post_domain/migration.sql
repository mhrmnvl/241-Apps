-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('BERITA', 'ARTIKEL', 'PENGUMUMAN');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaUsageKind" AS ENUM ('COVER', 'BODY', 'ATTACHMENT', 'ALBUM_PHOTO');

-- AlterEnum
ALTER TYPE "AppKey" ADD VALUE 'PORTAL';

-- CreateTable
CREATE TABLE "portal_posts" (
    "id" UUID NOT NULL,
    "type" "PostType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "summary" VARCHAR(500) NOT NULL,
    "body" TEXT NOT NULL,
    "cover_file_id" UUID,
    "cover_alt_text" VARCHAR(300),
    "category_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ,
    "scheduled_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ,
    "attachment_file_id" UUID,
    "pinned_at" TIMESTAMPTZ,
    "meta_title" VARCHAR(200),
    "meta_description" VARCHAR(300),
    "author_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "portal_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_post_slug_history" (
    "id" UUID NOT NULL,
    "post_id" UUID NOT NULL,
    "type" "PostType" NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_post_slug_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_post_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "slug" VARCHAR(120) NOT NULL,
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "portal_post_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portal_posts_type_status_published_at_idx" ON "portal_posts"("type", "status", "published_at");

-- CreateIndex
CREATE INDEX "portal_posts_type_pinned_at_published_at_idx" ON "portal_posts"("type", "pinned_at", "published_at");

-- CreateIndex
CREATE INDEX "portal_posts_deleted_at_idx" ON "portal_posts"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "portal_posts_type_slug_key" ON "portal_posts"("type", "slug");

-- CreateIndex
CREATE INDEX "portal_post_slug_history_post_id_idx" ON "portal_post_slug_history"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "portal_post_slug_history_type_slug_key" ON "portal_post_slug_history"("type", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "portal_post_categories_slug_key" ON "portal_post_categories"("slug");

-- AddForeignKey
ALTER TABLE "portal_posts" ADD CONSTRAINT "portal_posts_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "portal_post_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_posts" ADD CONSTRAINT "portal_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_posts" ADD CONSTRAINT "portal_posts_cover_file_id_fkey" FOREIGN KEY ("cover_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_posts" ADD CONSTRAINT "portal_posts_attachment_file_id_fkey" FOREIGN KEY ("attachment_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_post_slug_history" ADD CONSTRAINT "portal_post_slug_history_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "portal_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
