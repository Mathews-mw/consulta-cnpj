-- CreateTable
CREATE TABLE "spreadsheets" (
    "id" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spreadsheets_pkey" PRIMARY KEY ("id")
);
