-- ============================================================================
-- INVITATIONS SEED DATA
-- ============================================================================

INSERT INTO invitations (id, group_id, inviter_user_id, invitee_email, invitee_user_id, token, status, expires_at, created_at, accepted_at) VALUES
-- Accepted invitation - David joined Smith Family
(1, 1, 2, 'david.brown@example.com', 5, 'inv_token_001_accepted', 'accepted', '2024-01-25 09:00:00', '2024-01-18 09:00:00', '2024-01-18 15:00:00'),

-- Accepted invitation - Sarah joined College Roommates
(2, 2, 3, 'sarah.williams@example.com', 4, 'inv_token_002_accepted', 'accepted', '2024-02-09 11:00:00', '2024-02-02 11:00:00', '2024-02-02 11:00:00'),

-- Accepted invitation - Lisa joined College Roommates
(3, 2, 3, 'lisa.anderson@example.com', 8, 'inv_token_003_accepted', 'accepted', '2024-02-10 13:00:00', '2024-02-03 13:00:00', '2024-02-03 13:00:00'),

-- Accepted invitation - Emily joined Martinez-Davis Couple
(4, 3, 7, 'emily.davis@example.com', 6, 'inv_token_004_accepted', 'accepted', '2024-02-27 11:00:00', '2024-02-20 11:00:00', '2024-02-20 11:15:00'),

-- Pending invitation - Inviting new user to Smith Family
(5, 1, 2, 'robert.taylor@example.com', NULL, 'inv_token_005_pending', 'pending', '2024-12-29 10:00:00', '2024-12-22 10:00:00', NULL),

-- Declined invitation - Someone declined College Roommates
(6, 2, 3, 'jennifer.lee@example.com', NULL, 'inv_token_006_declined', 'declined', '2024-02-17 14:00:00', '2024-02-10 14:00:00', NULL),

-- Expired invitation
(7, 1, 1, 'old.user@example.com', NULL, 'inv_token_007_expired', 'expired', '2024-01-24 09:00:00', '2024-01-17 09:00:00', NULL);

-- Reset sequence
SELECT setval('invitations_id_seq', (SELECT MAX(id) FROM invitations));
