-- ============================================================================
-- GROUPS SEED DATA
-- ============================================================================

INSERT INTO groups (id, name, max_users, created_at) VALUES
(1, 'Smith Family', 4, '2024-01-16 12:00:00'),
(2, 'College Roommates', 3, '2024-02-01 10:00:00'),
(3, 'Martinez-Davis Couple', 2, '2024-02-20 11:00:00');

-- Reset sequence
SELECT setval('groups_id_seq', (SELECT MAX(id) FROM groups));
