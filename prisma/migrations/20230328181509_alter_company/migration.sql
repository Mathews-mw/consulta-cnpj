-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('PRINCIPAL', 'SECUNDARIA');

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "situacao" TEXT,
    "status" TEXT NOT NULL,
    "ultima_atualizacao" TEXT,
    "tipo" TEXT NOT NULL,
    "porte" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "nome_fantasia" TEXT,
    "abertura" TEXT NOT NULL,
    "natureza_juridica" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "logradouro" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "complemento" TEXT NOT NULL,
    "cep" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "uf" TEXT NOT NULL,
    "efr" TEXT,
    "data_situacao" TEXT,
    "motivo_situacao" TEXT,
    "situacao_especial" TEXT,
    "data_situacao_especial" TEXT,
    "capital_social" TEXT NOT NULL,
    "registrado_em" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizado_em" TIMESTAMP(3),

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_activities" (
    "id" TEXT NOT NULL,
    "company_cnpj" TEXT NOT NULL,
    "activity_code" TEXT NOT NULL,
    "activity_description" TEXT NOT NULL,
    "activity_type" "ActivityType" NOT NULL DEFAULT 'PRINCIPAL',

    CONSTRAINT "company_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_partners" (
    "id" TEXT NOT NULL,
    "company_cnpj" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "qualificacao_socio" TEXT,
    "pais_origem" TEXT,
    "nome_rep_legal" TEXT,
    "qual_rep_legal" TEXT,

    CONSTRAINT "company_partners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_cnpj_key" ON "company"("cnpj");

-- CreateIndex
CREATE INDEX "company_activities_company_cnpj_idx" ON "company_activities"("company_cnpj");

-- CreateIndex
CREATE INDEX "company_partners_company_cnpj_idx" ON "company_partners"("company_cnpj");

-- AddForeignKey
ALTER TABLE "company_activities" ADD CONSTRAINT "company_activities_company_cnpj_fkey" FOREIGN KEY ("company_cnpj") REFERENCES "company"("cnpj") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_partners" ADD CONSTRAINT "company_partners_company_cnpj_fkey" FOREIGN KEY ("company_cnpj") REFERENCES "company"("cnpj") ON DELETE CASCADE ON UPDATE CASCADE;
