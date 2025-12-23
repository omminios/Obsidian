-- ============================================================================
-- ACCOUNT MEMBERS SEED DATA
-- ============================================================================

INSERT INTO account_members (id, account_id, user_id, ownership_type, added_at) VALUES
-- John's accounts
(1, 1, 1, 'owner', '2024-01-15 10:30:00'),
(2, 2, 1, 'owner', '2024-01-15 10:30:00'),
(3, 3, 1, 'owner', '2024-01-15 10:30:00'),

-- Jane's accounts (Jane and John have joint savings)
(4, 4, 2, 'owner', '2024-01-16 12:30:00'),
(5, 5, 2, 'owner', '2024-01-16 12:30:00'),
(6, 5, 1, 'joint', '2024-01-17 09:30:00'),

-- Mike's accounts
(7, 6, 3, 'owner', '2024-01-20 15:00:00'),
(8, 7, 3, 'owner', '2024-01-20 15:30:00'),

-- Sarah's accounts (Sarah authorized on Mike's checking)
(9, 8, 4, 'owner', '2024-02-01 10:00:00'),
(10, 6, 4, 'authorized_user', '2024-02-10 15:00:00'),

-- David's accounts
(11, 9, 5, 'owner', '2024-02-05 17:00:00'),

-- Emily's accounts (Joint with Alex)
(12, 10, 6, 'owner', '2024-02-10 13:30:00'),
(13, 11, 6, 'owner', '2024-02-10 13:30:00'),
(14, 10, 7, 'joint', '2024-02-20 12:00:00'),

-- Alex's accounts
(15, 12, 7, 'owner', '2024-02-15 11:00:00'),

-- Lisa's accounts
(16, 13, 8, 'owner', '2024-03-01 08:30:00');

-- Reset sequence
SELECT setval('account_members_id_seq', (SELECT MAX(id) FROM account_members));
