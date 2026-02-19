-- Add entry_method column to distinguish how a transaction was recorded
-- 'plaid' = imported via Plaid, 'manual' = entered by user (e.g. cash transactions)

ALTER TABLE transactions
    ADD COLUMN entry_method VARCHAR(10) NOT NULL DEFAULT 'plaid'
    CHECK (entry_method IN ('plaid', 'manual'));

-- Backfill: any existing transaction without a plaid_id is manual
UPDATE transactions SET entry_method = 'manual' WHERE plaid_id IS NULL;
