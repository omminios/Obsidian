-- Store Plaid's raw account taxonomy (type + subtype) alongside our 4-bucket
-- account_type rollup. Keeps full fidelity (e.g. "mortgage", "401k", "hsa")
-- while the existing dashboard can keep grouping by the rollup column.
-- Nullable so manual accounts don't need to fill them in.

ALTER TABLE accounts
    ADD COLUMN plaid_type VARCHAR(50),
    ADD COLUMN plaid_subtype VARCHAR(50);

CREATE INDEX idx_accounts_plaid_type ON accounts (plaid_type);
