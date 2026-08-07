-- CreateTable
CREATE TABLE "portal_pages" (
    "id" UUID NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "body" TEXT NOT NULL,
    "meta_title" VARCHAR(200),
    "meta_description" VARCHAR(300),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "published_at" TIMESTAMPTZ,
    "author_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "portal_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_page_slug_history" (
    "id" UUID NOT NULL,
    "page_id" UUID NOT NULL,
    "slug" VARCHAR(220) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_page_slug_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_nav_items" (
    "id" UUID NOT NULL,
    "label" VARCHAR(60) NOT NULL,
    "page_id" UUID,
    "route_key" VARCHAR(60),
    "external_url" VARCHAR(500),
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "portal_nav_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_pages_slug_key" ON "portal_pages"("slug");

-- CreateIndex
CREATE INDEX "portal_pages_status_published_at_idx" ON "portal_pages"("status", "published_at");

-- CreateIndex
CREATE INDEX "portal_pages_deleted_at_idx" ON "portal_pages"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "portal_page_slug_history_slug_key" ON "portal_page_slug_history"("slug");

-- CreateIndex
CREATE INDEX "portal_page_slug_history_page_id_idx" ON "portal_page_slug_history"("page_id");

-- CreateIndex
CREATE INDEX "portal_nav_items_is_active_display_order_idx" ON "portal_nav_items"("is_active", "display_order");

-- AddForeignKey
ALTER TABLE "portal_pages" ADD CONSTRAINT "portal_pages_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_page_slug_history" ADD CONSTRAINT "portal_page_slug_history_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "portal_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_nav_items" ADD CONSTRAINT "portal_nav_items_page_id_fkey" FOREIGN KEY ("page_id") REFERENCES "portal_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
