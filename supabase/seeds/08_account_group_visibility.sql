-- ============================================================================
-- ACCOUNT GROUP VISIBILITY SEED DATA
-- ============================================================================

INSERT INTO account_group_visibility (id, account_id, group_id, visible_from, visible_until) VALUES
-- Smith Family can see Jane's checking and joint savings
(1, 4, 1, '2024-01-17 09:00:00', NULL),
(2, 5, 1, '2024-01-17 09:00:00', NULL),

-- College Roommates can see Mike's and Sarah's checking
(3, 6, 2, '2024-02-02 11:00:00', NULL),
(4, 8, 2, '2024-02-02 11:30:00', NULL),

-- Martinez-Davis Couple can see Emily and Alex's checking
(5, 10, 3, '2024-02-20 12:00:00', NULL),
(6, 12, 3, '2024-02-20 12:00:00', NULL);

-- Reset sequence
SELECT setval('account_group_visibility_id_seq', (SELECT MAX(id) FROM account_group_visibility));
