-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('worker', 'business');

-- CreateEnum
CREATE TYPE "PixKeyType" AS ENUM ('cpf', 'phone', 'email', 'cnpj', 'random');

-- CreateEnum
CREATE TYPE "WorkerLevel" AS ENUM ('BEGINNER', 'VERIFIED', 'TOP_PRO');

-- CreateEnum
CREATE TYPE "BusinessSegment" AS ENUM ('bar', 'restaurante', 'evento', 'hotel', 'varejo', 'saude', 'logistica', 'outro');

-- CreateEnum
CREATE TYPE "Specialty" AS ENUM ('garcom', 'bartender', 'aux_cozinha', 'promotor', 'caixa', 'repositor', 'cuidador', 'aux_logistica');

-- CreateEnum
CREATE TYPE "ShiftStatus" AS ENUM ('OPEN', 'FILLED', 'IN_PROGRESS', 'DONE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'NO_SHOW', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EscrowStatus" AS ENUM ('RESERVED', 'CONFIRMED', 'RELEASED', 'REFUNDED', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "full_name" TEXT NOT NULL,
    "cpf" TEXT,
    "photo_url" TEXT,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "pix_key" TEXT,
    "pix_key_type" "PixKeyType",
    "score" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "total_shifts" INTEGER NOT NULL DEFAULT 0,
    "on_time_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "level" "WorkerLevel" NOT NULL DEFAULT 'BEGINNER',
    "asaas_customer_id" TEXT,
    "suspended_until" TIMESTAMP(3),

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerSpecialty" (
    "id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "specialty" "Specialty" NOT NULL,

    CONSTRAINT "WorkerSpecialty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Business" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "trade_name" TEXT NOT NULL,
    "legal_name" TEXT NOT NULL,
    "segment" "BusinessSegment" NOT NULL,
    "address" JSONB NOT NULL,
    "asaas_customer_id" TEXT,
    "score" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessFavorite" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BusinessFavorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shift" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "specialty" "Specialty" NOT NULL,
    "starts_at" TIMESTAMP(3) NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "slots" INTEGER NOT NULL DEFAULT 1,
    "rate_per_hour" DECIMAL(10,2) NOT NULL,
    "total_value" DECIMAL(10,2) NOT NULL,
    "laboro_fee" DECIMAL(10,2) NOT NULL,
    "instructions" TEXT,
    "status" "ShiftStatus" NOT NULL DEFAULT 'OPEN',
    "address" JSONB,
    "is_urgent" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "Shift_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftApplication" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "checkin_at" TIMESTAMP(3),
    "checkin_lat" DECIMAL(10,7),
    "checkin_lng" DECIMAL(10,7),
    "checkout_at" TIMESTAMP(3),
    "hours_worked" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscrowTransaction" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "worker_id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "gross_amount" DECIMAL(10,2) NOT NULL,
    "laboro_fee" DECIMAL(10,2) NOT NULL,
    "worker_amount" DECIMAL(10,2) NOT NULL,
    "status" "EscrowStatus" NOT NULL DEFAULT 'RESERVED',
    "asaas_payment_id" TEXT,
    "asaas_transfer_id" TEXT,
    "idempotency_key" TEXT NOT NULL,
    "reserved_at" TIMESTAMP(3),
    "confirmed_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "refunded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscrowTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rating" (
    "id" TEXT NOT NULL,
    "shift_id" TEXT NOT NULL,
    "from_id" TEXT NOT NULL,
    "to_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "tags" TEXT[],
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rating_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_user_id_key" ON "Worker"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "WorkerSpecialty_worker_id_specialty_key" ON "WorkerSpecialty"("worker_id", "specialty");

-- CreateIndex
CREATE UNIQUE INDEX "Business_user_id_key" ON "Business"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Business_cnpj_key" ON "Business"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "BusinessFavorite_business_id_worker_id_key" ON "BusinessFavorite"("business_id", "worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "ShiftApplication_shift_id_worker_id_key" ON "ShiftApplication"("shift_id", "worker_id");

-- CreateIndex
CREATE UNIQUE INDEX "EscrowTransaction_idempotency_key_key" ON "EscrowTransaction"("idempotency_key");

-- CreateIndex
CREATE UNIQUE INDEX "Rating_shift_id_from_id_key" ON "Rating"("shift_id", "from_id");

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerSpecialty" ADD CONSTRAINT "WorkerSpecialty_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Business" ADD CONSTRAINT "Business_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BusinessFavorite" ADD CONSTRAINT "BusinessFavorite_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shift" ADD CONSTRAINT "Shift_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "Business"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftApplication" ADD CONSTRAINT "ShiftApplication_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftApplication" ADD CONSTRAINT "ShiftApplication_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscrowTransaction" ADD CONSTRAINT "EscrowTransaction_shift_id_fkey" FOREIGN KEY ("shift_id") REFERENCES "Shift"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_to_id_fkey" FOREIGN KEY ("to_id") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
