-- ============================================================================
-- Audit log table
-- Captures INSERT, UPDATE, and DELETE operations across core tables
-- with before/after snapshots stored as JSONB
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id INT,                        -- who performed the action (NULL for system/plaid)
    group_id INT,                       -- group context if applicable
    session_id VARCHAR(255),            -- request/session identifier
    ip_address INET,                    -- client IP address
    table_name VARCHAR(50) NOT NULL,    -- which table was affected
    record_id INT NOT NULL,             -- PK of the affected row
    operation VARCHAR(10) NOT NULL,     -- what happened
    old_data JSONB,                     -- row state before the change (NULL on INSERT)
    new_data JSONB,                     -- row state after the change (NULL on DELETE)
    changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
    exported_at TIMESTAMP,              -- NULL until picked up by SQS pipeline
    action_source VARCHAR(20) NOT NULL, -- who/what initiated the action

    CONSTRAINT valid_table_name CHECK (table_name IN (
        'users',
        'accounts',
        'transactions',
        'groups',
        'account_members',
        'group_memberships',
        'account_group_visibility',
        'invitations'
    )),
    CONSTRAINT valid_operation CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    CONSTRAINT valid_action_source CHECK (action_source IN ('user', 'admin', 'plaid', 'system'))
);

-- ============================================================================
-- Indexes optimized for SQS queue export
-- ============================================================================

-- Process unexported rows in chronological order
CREATE INDEX idx_audit_changed_at ON audit_log (changed_at ASC);

-- Fast lookup for rows not yet exported to S3
CREATE INDEX idx_audit_unexported ON audit_log (exported_at) WHERE exported_at IS NULL;
