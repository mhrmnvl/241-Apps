-- CreateTable
CREATE TABLE "portal_gallery_albums" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "description" TEXT,
    "event_date" DATE NOT NULL,
    "cover_file_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ,
    "scheduled_at" TIMESTAMPTZ,
    "author_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "portal_gallery_albums_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_gallery_photos" (
    "id" UUID NOT NULL,
    "album_id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "caption" VARCHAR(300),
    "alt_text" VARCHAR(300) NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_gallery_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_gallery_albums_slug_key" ON "portal_gallery_albums"("slug");

-- CreateIndex
CREATE INDEX "portal_gallery_albums_status_published_at_idx" ON "portal_gallery_albums"("status", "published_at");

-- CreateIndex
CREATE INDEX "portal_gallery_albums_status_event_date_idx" ON "portal_gallery_albums"("status", "event_date");

-- CreateIndex
CREATE INDEX "portal_gallery_albums_deleted_at_idx" ON "portal_gallery_albums"("deleted_at");

-- CreateIndex
CREATE INDEX "portal_gallery_photos_album_id_display_order_idx" ON "portal_gallery_photos"("album_id", "display_order");

-- AddForeignKey
ALTER TABLE "portal_gallery_albums" ADD CONSTRAINT "portal_gallery_albums_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_gallery_albums" ADD CONSTRAINT "portal_gallery_albums_cover_file_id_fkey" FOREIGN KEY ("cover_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_gallery_photos" ADD CONSTRAINT "portal_gallery_photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "portal_gallery_albums"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_gallery_photos" ADD CONSTRAINT "portal_gallery_photos_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
