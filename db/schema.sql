-- ============================================================================
-- CORE ENTITIES (Future Neo4j Nodes)
-- ============================================================================


CREATE TABLE groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    group_type VARCHAR(255) NOT NULL, --solo, couple, roomates are the only options
    max_users INT DEFAULT 1 CHECK (max_users >= 1 AND max_users <= 4),
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT group_typing CHECK (group_type IN ('solo', 'couple', 'roomates'))
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    group_id INT REFERENCES groups(id),
    email VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(30),
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    contribution VARCHAR(20) DEFAULT 'member', --either creator or member of associated group
    joined_group_at TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT valid_contribution CHECK((contribution IN ('creator', 'member')))
);

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    amount DECIMAL(12,2),
    description TEXT,
    transacion_date DATE NOT NULL,
    category VARCHAR(50),
    merchant_name VARCHAR(255),
    plaid_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
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
    updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- RELATIONSHIP TABLES (Future Neo4j Edges)
-- ============================================================================

-- Explicit transaction visibility
CREATE TABLE transaction_visibility (
    id SERIAL PRIMARY KEY,
    transaction_id INT NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scope VARCHAR(20) NOT NULL, -- 'personal', 'shared'
    created_at TIMESTAMP DEFAULT NOW(),

    CONSTRAINT unique_transaction_visibility UNIQUE (transaction_id, user_id),
    CONSTRAINT valid_scope CHECK (scope IN ('personal', 'shared'))
    
);

CREATE TABLE account_members (
    id SERIAL PRIMARY KEY,
    account_id INT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE UNIQUE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
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
-- OTHER TABLES
-- ============================================================================

-- Improved invitations
CREATE TABLE invitations (
    id SERIAL PRIMARY KEY,
    group_id INT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    inviter_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invitee_email VARCHAR(255) NOT NULL,
    invitee_user_id INT REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    expires_at TIMESTAMP NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMP DEFAULT NOW(),
    accepted_at TIMESTAMP
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
-- Index (will decide what to index later)
-- ============================================================================
/*

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_group ON users(group_id);

-- Transactions
CREATE INDEX idx_transactions_group ON transactions(group_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date);
CREATE INDEX idx_transactions_group_date ON transactions(group_id, transaction_date);

-- Accounts
CREATE INDEX idx_accounts_group ON accounts(group_id);
CREATE INDEX idx_accounts_active ON accounts(is_active) WHERE is_active = TRUE;

-- Transaction visibility
CREATE INDEX idx_transaction_visibility_user ON transaction_visibility(user_id);
CREATE INDEX idx_transaction_visibility_transaction ON transaction_visibility(transaction_id);

-- Account members
CREATE INDEX idx_account_members_user ON account_members(user_id);
CREATE INDEX idx_account_members_account ON account_members(account_id);

-- Account transactions
CREATE INDEX idx_account_transactions_account ON account_transactions(account_id);
CREATE INDEX idx_account_transactions_transaction ON account_transactions(transaction_id);

-- Invitations
CREATE INDEX idx_invitations_group ON invitations(group_id);
CREATE INDEX idx_invitations_token ON invitations(token);
CREATE INDEX idx_invitations_status ON invitations(status) WHERE status = 'pending';
*/