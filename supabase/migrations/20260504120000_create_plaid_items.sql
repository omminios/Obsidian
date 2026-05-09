-- ============================================================================
-- Plaid Items: stores per-institution access tokens (encrypted) and sync cursor
-- ============================================================================
-- One row per Plaid Item (institution link) belonging to a user. The Plaid
-- access_token is the long-lived credential used for /accounts/get and
-- /transactions/sync; it is encrypted at rest with AES-256-GCM (key in
-- PLAID_ENCRYPTION_KEY env var). transactions_cursor checkpoints the
-- /transactions/sync stream so we only fetch new transactions on each call.

CREATE TABLE IF NOT EXISTS plaid_items (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plaid_item_id VARCHAR(255) UNIQUE NOT NULL,
    institution_id VARCHAR(255),
    institution_name VARCHAR(255),
    access_token_ciphertext TEXT NOT NULL,
    access_token_iv VARCHAR(32) NOT NULL,
    access_token_tag VARCHAR(32) NOT NULL,
    transactions_cursor TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plaid_items_user ON plaid_items (user_id);

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON plaid_items
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

ALTER TABLE plaid_items ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- transactions.plaid_id uniqueness
-- ============================================================================
-- /transactions/sync may replay 'added' rows on retries; ON CONFLICT (plaid_id)
-- DO NOTHING needs a unique constraint. Manually-entered transactions have a
-- NULL plaid_id, so this is a partial index to allow many NULLs.

CREATE UNIQUE INDEX idx_transactions_plaid_id_unique
  ON transactions (plaid_id)
  WHERE plaid_id IS NOT NULL;
