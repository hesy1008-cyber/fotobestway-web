-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN "isSpam" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Inquiry" ADD COLUMN "spamReason" TEXT;
ALTER TABLE "Inquiry" ADD COLUMN "ip" TEXT;

-- CreateTable
CREATE TABLE "SpamBlock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT,
    "ip" TEXT,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "SpamBlock_email_idx" ON "SpamBlock"("email");
CREATE INDEX "SpamBlock_ip_idx" ON "SpamBlock"("ip");
