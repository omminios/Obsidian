-- ============================================================================
-- USERS SEED DATA
-- ============================================================================

INSERT INTO users (id, email, username, password_hash, first_name, last_name, created_at, updated_at) VALUES
(1, 'john.doe@example.com', 'johndoe', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'John', 'Doe', '2024-01-15 10:00:00', '2024-01-15 10:00:00'),
(2, 'jane.smith@example.com', 'janesmith', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Jane', 'Smith', '2024-01-16 11:30:00', '2024-01-16 11:30:00'),
(3, 'mike.johnson@example.com', 'mikej', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Mike', 'Johnson', '2024-01-20 14:20:00', '2024-01-20 14:20:00'),
(4, 'sarah.williams@example.com', 'sarahw', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Sarah', 'Williams', '2024-02-01 09:15:00', '2024-02-01 09:15:00'),
(5, 'david.brown@example.com', 'davidb', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'David', 'Brown', '2024-02-05 16:45:00', '2024-02-05 16:45:00'),
(6, 'emily.davis@example.com', 'emilyd', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Emily', 'Davis', '2024-02-10 13:00:00', '2024-02-10 13:00:00'),
(7, 'alex.martinez@example.com', 'alexm', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Alex', 'Martinez', '2024-02-15 10:30:00', '2024-02-15 10:30:00'),
(8, 'lisa.anderson@example.com', 'lisaa', '$2a$10$abcdefghijklmnopqrstuvwxyz123456', 'Lisa', 'Anderson', '2024-03-01 08:00:00', '2024-03-01 08:00:00');

-- Reset sequence
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
