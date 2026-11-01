-- Inscription avec nom complet, et motif de chaque code (connexion ou inscription).
ALTER TABLE "User" ADD COLUMN "name" TEXT;
ALTER TABLE "EmailCode" ADD COLUMN "purpose" TEXT NOT NULL DEFAULT 'connexion';
ALTER TABLE "EmailCode" ADD COLUMN "name" TEXT;
