-- CreateTable
CREATE TABLE "portal_agenda_entries" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "description" TEXT NOT NULL,
    "start_time" TIMESTAMPTZ NOT NULL,
    "end_time" TIMESTAMPTZ NOT NULL,
    "location" VARCHAR(200) NOT NULL,
    "cover_file_id" UUID,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ,
    "scheduled_at" TIMESTAMPTZ,
    "author_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "portal_agenda_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_agenda_entries_slug_key" ON "portal_agenda_entries"("slug");

-- CreateIndex
CREATE INDEX "portal_agenda_entries_status_start_time_idx" ON "portal_agenda_entries"("status", "start_time");

-- CreateIndex
CREATE INDEX "portal_agenda_entries_status_end_time_idx" ON "portal_agenda_entries"("status", "end_time");

-- CreateIndex
CREATE INDEX "portal_agenda_entries_deleted_at_idx" ON "portal_agenda_entries"("deleted_at");

-- AddForeignKey
ALTER TABLE "portal_agenda_entries" ADD CONSTRAINT "portal_agenda_entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_agenda_entries" ADD CONSTRAINT "portal_agenda_entries_cover_file_id_fkey" FOREIGN KEY ("cover_file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
