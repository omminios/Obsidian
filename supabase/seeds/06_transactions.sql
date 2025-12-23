-- ============================================================================
-- TRANSACTIONS SEED DATA
-- ============================================================================

INSERT INTO transactions (id, user_id, amount, description, transaction_date, category, merchant_name, plaid_id, created_at, updated_at) VALUES
-- John's transactions
(1, 1, -45.50, 'Grocery shopping', '2024-12-15', 'groceries', 'Whole Foods', 'plaid_txn_001', '2024-12-15 18:00:00', '2024-12-15 18:00:00'),
(2, 1, -120.00, 'Electric bill', '2024-12-10', 'utilities', 'Pacific Gas & Electric', 'plaid_txn_002', '2024-12-10 09:00:00', '2024-12-10 09:00:00'),
(3, 1, 3500.00, 'Salary deposit', '2024-12-01', 'income', 'Acme Corp', 'plaid_txn_003', '2024-12-01 08:00:00', '2024-12-01 08:00:00'),
(4, 1, -85.30, 'Restaurant dinner', '2024-12-18', 'dining', 'Olive Garden', 'plaid_txn_004', '2024-12-18 20:00:00', '2024-12-18 20:00:00'),

-- Jane's transactions
(5, 2, -250.00, 'Car insurance', '2024-12-05', 'insurance', 'State Farm', 'plaid_txn_005', '2024-12-05 10:00:00', '2024-12-05 10:00:00'),
(6, 2, 4200.00, 'Salary deposit', '2024-12-01', 'income', 'Tech Startup Inc', 'plaid_txn_006', '2024-12-01 08:00:00', '2024-12-01 08:00:00'),
(7, 2, -65.75, 'Grocery shopping', '2024-12-16', 'groceries', 'Trader Joes', 'plaid_txn_007', '2024-12-16 17:30:00', '2024-12-16 17:30:00'),

-- Mike's transactions
(8, 3, -1200.00, 'Rent payment', '2024-12-01', 'housing', 'Property Management Co', 'plaid_txn_008', '2024-12-01 09:00:00', '2024-12-01 09:00:00'),
(9, 3, 3800.00, 'Salary deposit', '2024-12-01', 'income', 'Marketing Agency LLC', 'plaid_txn_009', '2024-12-01 08:00:00', '2024-12-01 08:00:00'),
(10, 3, -45.00, 'Gas station', '2024-12-12', 'transportation', 'Shell', 'plaid_txn_010', '2024-12-12 16:00:00', '2024-12-12 16:00:00'),

-- Sarah's transactions
(11, 4, -89.99, 'Streaming services', '2024-12-08', 'entertainment', 'Netflix', 'plaid_txn_011', '2024-12-08 12:00:00', '2024-12-08 12:00:00'),
(12, 4, 2800.00, 'Salary deposit', '2024-12-01', 'income', 'Design Studio', 'plaid_txn_012', '2024-12-01 08:00:00', '2024-12-01 08:00:00'),

-- David's transactions
(13, 5, -175.50, 'Home improvement', '2024-12-14', 'home', 'Home Depot', 'plaid_txn_013', '2024-12-14 14:00:00', '2024-12-14 14:00:00'),
(14, 5, 5500.00, 'Salary deposit', '2024-12-01', 'income', 'Engineering Firm', 'plaid_txn_014', '2024-12-01 08:00:00', '2024-12-01 08:00:00'),

-- Emily's transactions
(15, 6, -320.00, 'Gym membership annual', '2024-12-03', 'health', 'LA Fitness', 'plaid_txn_015', '2024-12-03 11:00:00', '2024-12-03 11:00:00'),
(16, 6, 3900.00, 'Salary deposit', '2024-12-01', 'income', 'Healthcare Provider', 'plaid_txn_016', '2024-12-01 08:00:00', '2024-12-01 08:00:00'),

-- Alex's transactions
(17, 7, -95.00, 'Internet bill', '2024-12-11', 'utilities', 'Comcast', 'plaid_txn_017', '2024-12-11 10:00:00', '2024-12-11 10:00:00'),
(18, 7, 4100.00, 'Salary deposit', '2024-12-01', 'income', 'Software Company', 'plaid_txn_018', '2024-12-01 08:00:00', '2024-12-01 08:00:00'),

-- Lisa's transactions
(19, 8, -150.00, 'Phone bill', '2024-12-07', 'utilities', 'Verizon', 'plaid_txn_019', '2024-12-07 09:00:00', '2024-12-07 09:00:00'),
(20, 8, 3200.00, 'Salary deposit', '2024-12-01', 'income', 'Consulting Firm', 'plaid_txn_020', '2024-12-01 08:00:00', '2024-12-01 08:00:00');

-- Reset sequence
SELECT setval('transactions_id_seq', (SELECT MAX(id) FROM transactions));
