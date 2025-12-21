-- ============================================================================
-- CORE ENTITIES (Future Neo4j Nodes)
-- ============================================================================

-- Groups only exist after an invitation is accpeted users start without a group

CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    max_users INT DEFAULT 1 CHECK (max_users >= 1 AND max_users <= 8),
    created_at TIMESTAMP DEFAULT NOW() --Creation of the group 
);

-- individual entities for the platform

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE, -- tracking transactions on user accounts
    amount DECIMAL(12,2),
    description TEXT,
    transacion_date DATE NOT NULL,
    category VARCHAR(50),
    merchant_name VARCHAR(255),
    plaid_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Fiduciary accounts
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES user(id) ON DELETE CASCADE,
    account_name VARCHAR(255) NOT NULL,
    account_type VARCHAR(50), -- 'checking', 'savings', 'credit', 'investment'
    institution_name VARCHAR(255),
    last_four VARCHAR(4), -- Last 4 digits for identification
    plaid_account_id VARCHAR(255) UNIQUE,
    plaid_item_id VARCHAR(255), -- Groups accounts from same institution
    balance_current DECIMAL(12,2),
    balance_available DECIMAL(12,2),
    currency_code VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT valid_account_type CHECK(account_type IN ('checking', 'savings', 'credit', 'investment'))
);

-- ============================================================================
-- RELATIONSHIP TABLES (Future Neo4j Edges)
-- ============================================================================

-- Explicit transaction visibility

CREATE TABLE group_memberships (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- creator or member
    joined_group_at NOT NULL TIMESTAMP DEFAULT NOW(),
    departed_at TIMESTAMP,

    CONSTRAINT valid_role CHECK (role In ('creator', 'member')),
    CONSTRAINT unique_active_membership UNIQUE(user_id, group_id)
);

CREATE TABLE account_group_visibility (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    visible_from TIMESTAMP NOT NULL DEFAULT NOW(),
    visible_until TIMESTAMP,  -- null = still visible
    
    CONSTRAINT unique_account_group UNIQUE(account_id, group_id)
);

CREATE TABLE account_members (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ownership_type VARCHAR(20) NOT NULL, -- 'owner', 'joint', 'authorized_user',
    added_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_account_membership UNIQUE(account_id, user_id),
    CONSTRAINT valid_ownership CHECK (ownership_type IN ('owner', 'joint', 'authorized_user'))
);

CREATE TABLE account_transactions (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    transaction_id INT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    transaction_type VARCHAR(20) NOT NULL, -- 'debit', 'credit', 'transfer'
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_account_transaction UNIQUE(account_id, transaction_id),
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('debit', 'credit', 'transfer'))
);

-- ============================================================================
-- Invitation and Auth
-- ============================================================================

-- Improved invitations
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id) ON DELETE CASCADE,
    inviter_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    invitee_user_id INT REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP,

    CONSTRAINT invitation_statuses CHECK (status IN('pending', 'accepted', 'declined', 'expired'))
);

-- Password Reset Tokens: For password recovery
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- Indexs
-- ============================================================================

-- account indexes

CREATE INDEX idx_account_users on account (user_id),
CREATE INDEX idx_account_is_active on accounts (user_id, is_active) WHERE is_active = 'true';



-- transactions

CREATE INDEX idx_transaction_users on transactions (user_id),
CREATE INDEX idx_transaction_dates on transactions (user_id, transacion_date DESC),
CREATE INDEX idx_transactions_date ON transactions(transaction_date);

-- group memberships

CREATE INDEX idx_membership_users on group_memberships (user_id),
CREATE INDEX idx_membership_groups on group_memberships (group_id),
CREATE INDEX idx_membership_active_users on group_memberships (user_id) WHERE departed_at IS NULL

-- account visibility

CREATE INDEX idx_group_visibility_group on account_group_visibility (group_id)
CREATE INDEX idx_group_visibility_account on account_group_visibility (account_id)

-- account members

CREATE INDEX idx_account_members_account ON account_members(account_id);
CREATE INDEX idx_account_members_user ON account_members(user_id);

-- account transactions

CREATE INDEX idx_acct_txn_transaction ON account_transactions(transaction_id);
CREATE INDEX idx_acct_txn_account ON account_transactions(account_id);

--invitation

CREATE INDEX idx_invitations_inviter ON invitations(inviter_user_id);
CREATE INDEX idx_invitations_pending ON invitations(inviter_user_id) WHERE status = 'pending';

-- passwords

CREATE INDEX idx_reset_tokens_user ON password_reset_tokens(user_id);