-- ============================================================================
-- ACCOUNT TRANSACTIONS SEED DATA
-- ============================================================================

INSERT INTO account_transactions (id, account_id, transaction_id, transaction_type, created_at) VALUES
-- John's account transactions
(1, 1, 1, 'debit', '2024-12-15 18:00:00'),
(2, 1, 2, 'debit', '2024-12-10 09:00:00'),
(3, 1, 3, 'credit', '2024-12-01 08:00:00'),
(4, 3, 4, 'debit', '2024-12-18 20:00:00'),

-- Jane's account transactions
(5, 4, 5, 'debit', '2024-12-05 10:00:00'),
(6, 4, 6, 'credit', '2024-12-01 08:00:00'),
(7, 4, 7, 'debit', '2024-12-16 17:30:00'),

-- Mike's account transactions
(8, 6, 8, 'debit', '2024-12-01 09:00:00'),
(9, 6, 9, 'credit', '2024-12-01 08:00:00'),
(10, 6, 10, 'debit', '2024-12-12 16:00:00'),

-- Sarah's account transactions
(11, 8, 11, 'debit', '2024-12-08 12:00:00'),
(12, 8, 12, 'credit', '2024-12-01 08:00:00'),

-- David's account transactions
(13, 9, 13, 'debit', '2024-12-14 14:00:00'),
(14, 9, 14, 'credit', '2024-12-01 08:00:00'),

-- Emily's account transactions
(15, 11, 15, 'debit', '2024-12-03 11:00:00'),
(16, 10, 16, 'credit', '2024-12-01 08:00:00'),

-- Alex's account transactions
(17, 12, 17, 'debit', '2024-12-11 10:00:00'),
(18, 12, 18, 'credit', '2024-12-01 08:00:00'),

-- Lisa's account transactions
(19, 13, 19, 'debit', '2024-12-07 09:00:00'),
(20, 13, 20, 'credit', '2024-12-01 08:00:00');

-- Reset sequence
SELECT setval('account_transactions_id_seq', (SELECT MAX(id) FROM account_transactions));
