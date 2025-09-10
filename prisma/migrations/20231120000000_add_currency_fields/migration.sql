-- Add currency fields to Assets table
ALTER TABLE "Assets" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE "Assets" ADD COLUMN "exchange_rate" DECIMAL(10, 4);
ALTER TABLE "Assets" ADD COLUMN "cost_in_naira" DECIMAL(15, 2);
ALTER TABLE "Assets" ADD COLUMN "recurrent_currency" TEXT NOT NULL DEFAULT 'NGN';
ALTER TABLE "Assets" ADD COLUMN "recurrent_exchange_rate" DECIMAL(10, 4);
ALTER TABLE "Assets" ADD COLUMN "recurrent_in_naira" DECIMAL(15, 2);