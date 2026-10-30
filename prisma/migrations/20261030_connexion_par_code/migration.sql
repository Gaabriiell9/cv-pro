-- Connexion par code : plus de mot de passe ni de jeton de réinitialisation.

-- DropForeignKey
ALTER TABLE "ResetToken" DROP CONSTRAINT "ResetToken_userId_fkey";

-- DropTable
DROP TABLE "ResetToken";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash";

-- DropIndex
DROP INDEX "EmailCode_email_idx";

-- CreateIndex
CREATE INDEX "EmailCode_email_createdAt_idx" ON "EmailCode"("email", "createdAt");
