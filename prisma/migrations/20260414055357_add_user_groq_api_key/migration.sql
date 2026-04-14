-- AlterTable
ALTER TABLE "User" ADD COLUMN     "groqApiKeyEncrypted" TEXT,
ADD COLUMN     "groqApiKeyUpdatedAt" TIMESTAMP(3);
