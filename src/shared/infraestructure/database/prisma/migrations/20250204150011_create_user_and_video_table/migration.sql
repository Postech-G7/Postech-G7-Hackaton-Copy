-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('processing', 'completed', 'failed', 'retrieved');

-- CreateTable
CREATE TABLE "videos" (
    "id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "userEmail" VARCHAR(255) NOT NULL,
    "base64" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "status" "VideoStatus" NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "videos_userId_idx" ON "videos"("userId");

-- CreateIndex
CREATE INDEX "videos_userEmail_idx" ON "videos"("userEmail");

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
