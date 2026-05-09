-- Track Plaid's pending → posted state. Pending transactions are authorized
-- but not yet settled; their amount, date, and merchant can still change.
-- Plaid surfaces these via `modified` on /transactions/sync once they post.

ALTER TABLE transactions
    ADD COLUMN pending BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX idx_transactions_pending
    ON transactions (user_id)
    WHERE pending = TRUE;
