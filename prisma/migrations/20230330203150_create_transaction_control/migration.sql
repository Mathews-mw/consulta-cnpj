-- CreateEnum
CREATE TYPE "ETransactionControlStatus" AS ENUM ('ATUALIZANDO', 'CANCELADA', 'CONCLUIDA');

-- CreateEnum
CREATE TYPE "ETransactionControlProcessType" AS ENUM ('CADASTRO_FORNECEDOR', 'CONSULTA_FORNECEDOR', 'REVALIDACAO_FORNECEDOR');

-- CreateTable
CREATE TABLE "transaction_control" (
    "id" TEXT NOT NULL,
    "process_type" "ETransactionControlProcessType" NOT NULL,
    "status" "ETransactionControlStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "transaction_control_pkey" PRIMARY KEY ("id")
);
