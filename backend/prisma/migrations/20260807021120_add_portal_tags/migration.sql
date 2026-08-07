-- CreateTable
CREATE TABLE "portal_tags" (
    "id" UUID NOT NULL,
    "name" VARCHAR(60) NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "portal_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "portal_post_tags" (
    "post_id" UUID NOT NULL,
    "tag_id" UUID NOT NULL,

    CONSTRAINT "portal_post_tags_pkey" PRIMARY KEY ("post_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "portal_tags_slug_key" ON "portal_tags"("slug");

-- CreateIndex
CREATE INDEX "portal_post_tags_tag_id_idx" ON "portal_post_tags"("tag_id");

-- AddForeignKey
ALTER TABLE "portal_post_tags" ADD CONSTRAINT "portal_post_tags_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "portal_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "portal_post_tags" ADD CONSTRAINT "portal_post_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "portal_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
