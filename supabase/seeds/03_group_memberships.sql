-- ============================================================================
-- GROUP MEMBERSHIPS SEED DATA
-- ============================================================================
-- NOTE: Each user can only belong to ONE group at a time

INSERT INTO group_memberships (id, group_id, user_id, role, joined_group_at, departed_at) VALUES
-- Smith Family (Jane is creator, John and David are members)
(1, 1, 2, 'creator', '2024-01-16 12:00:00', NULL),
(2, 1, 1, 'member', '2024-01-17 09:00:00', NULL),
(3, 1, 5, 'member', '2024-01-18 15:00:00', NULL),

-- College Roommates (Mike is creator, Sarah and Lisa are members)
(4, 2, 3, 'creator', '2024-02-01 10:00:00', NULL),
(5, 2, 4, 'member', '2024-02-02 11:00:00', NULL),
(6, 2, 8, 'member', '2024-02-03 13:00:00', NULL),

-- Martinez-Davis Couple (Alex is creator, Emily is member)
(7, 3, 7, 'creator', '2024-02-20 11:00:00', NULL),
(8, 3, 6, 'member', '2024-02-20 11:15:00', NULL);

-- Reset sequence
SELECT setval('group_memberships_id_seq', (SELECT MAX(id) FROM group_memberships));
