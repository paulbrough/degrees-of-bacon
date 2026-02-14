-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "watch_list_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "poster_path" TEXT,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "watch_list_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cached_productions" (
    "id" TEXT NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "media_type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "imdb_rating" DOUBLE PRECISION,
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cached_productions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cached_persons" (
    "id" TEXT NOT NULL,
    "tmdb_id" INTEGER NOT NULL,
    "data" JSONB NOT NULL,
    "cached_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cached_persons_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "watch_list_entries_user_id_idx" ON "watch_list_entries"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "watch_list_entries_user_id_tmdb_id_media_type_key" ON "watch_list_entries"("user_id", "tmdb_id", "media_type");

-- CreateIndex
CREATE INDEX "cached_productions_tmdb_id_media_type_idx" ON "cached_productions"("tmdb_id", "media_type");

-- CreateIndex
CREATE UNIQUE INDEX "cached_productions_tmdb_id_media_type_key" ON "cached_productions"("tmdb_id", "media_type");

-- CreateIndex
CREATE UNIQUE INDEX "cached_persons_tmdb_id_key" ON "cached_persons"("tmdb_id");

-- CreateIndex
CREATE INDEX "cached_persons_tmdb_id_idx" ON "cached_persons"("tmdb_id");

-- AddForeignKey
ALTER TABLE "watch_list_entries" ADD CONSTRAINT "watch_list_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
