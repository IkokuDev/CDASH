-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_assets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "summary" TEXT,
    "acquired" DATETIME NOT NULL,
    "cost" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "exchange_rate" REAL,
    "cost_in_naira" REAL,
    "status" TEXT NOT NULL,
    "purpose" TEXT,
    "technical_details" TEXT,
    "sub_category" TEXT,
    "recurrent_expenditure" REAL,
    "recurrent_currency" TEXT DEFAULT 'NGN',
    "recurrent_exchange_rate" REAL,
    "recurrent_in_naira" REAL,
    "ai_summary" TEXT,
    "image_url" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_assets" ("acquired", "ai_summary", "cost", "created_at", "id", "image_url", "name", "purpose", "recurrent_expenditure", "status", "sub_category", "summary", "technical_details", "type", "updated_at") SELECT "acquired", "ai_summary", "cost", "created_at", "id", "image_url", "name", "purpose", "recurrent_expenditure", "status", "sub_category", "summary", "technical_details", "type", "updated_at" FROM "assets";
DROP TABLE "assets";
ALTER TABLE "new_assets" RENAME TO "assets";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
