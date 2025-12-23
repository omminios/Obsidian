-- ============================================================================
-- PASSWORD RESET TOKENS SEED DATA
-- ============================================================================

INSERT INTO password_reset_tokens (id, user_id, token, expires_at, used_at, created_at) VALUES
-- Used token (John reset password)
(1, 1, 'reset_token_001_used', '2024-11-20 10:00:00', '2024-11-20 09:30:00', '2024-11-20 09:00:00'),

-- Expired token (Jane never used it)
(2, 2, 'reset_token_002_expired', '2024-10-15 12:00:00', NULL, '2024-10-15 11:00:00'),

-- Active token (Mike just requested)
(3, 3, 'reset_token_003_active', '2024-12-23 14:00:00', NULL, '2024-12-22 14:00:00');

-- Reset sequence
SELECT setval('password_reset_tokens_id_seq', (SELECT MAX(id) FROM password_reset_tokens));
