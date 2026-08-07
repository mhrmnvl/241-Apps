-- CreateTable
CREATE TABLE "portal_media_usages" (
    "id" UUID NOT NULL,
    "file_id" UUID NOT NULL,
    "kind" "MediaUsageKind" NOT NULL,
    "post_id" UUID,
    "agenda_id" UUID,
    "album_id" UUID,
    "page_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_media_usages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "portal_media_usages_file_id_idx" ON "portal_media_usages"("file_id");

-- CreateIndex
CREATE INDEX "portal_media_usages_post_id_idx" ON "portal_media_usages"("post_id");

-- CreateIndex
CREATE INDEX "portal_media_usages_agenda_id_idx" ON "portal_media_usages"("agenda_id");

-- CreateIndex
CREATE INDEX "portal_media_usages_album_id_idx" ON "portal_media_usages"("album_id");

-- CreateIndex
CREATE INDEX "portal_media_usages_page_id_idx" ON "portal_media_usages"("page_id");

-- AddForeignKey
ALTER TABLE "portal_media_usages" ADD CONSTRAINT "portal_media_usages_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_media_usages" ADD CONSTRAINT "portal_media_usages_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "portal_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
