-- Migration: switch from phone-OTP auth to email/password auth

-- Add new columns as nullable first (to handle existing rows)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password_hash" TEXT;

-- Update existing rows with placeholder values so NOT NULL works
UPDATE "User" SET
  "email" = CONCAT('legacy_', id, '@laboro.invalid'),
  "password_hash" = ''
WHERE "email" IS NULL;

-- Now apply NOT NULL constraints
ALTER TABLE "User" ALTER COLUMN "email" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "password_hash" SET NOT NULL;

-- Add unique constraint on email
ALTER TABLE "User" ADD CONSTRAINT "User_email_key" UNIQUE ("email");

-- Make phone optional (it was required before)
ALTER TABLE "User" ALTER COLUMN "phone" DROP NOT NULL;
