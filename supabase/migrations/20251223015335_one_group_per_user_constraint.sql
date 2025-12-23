CREATE UNIQUE INDEX idx_one_active_group_per_user ON group_memberships (user_id) WHERE departed_at IS NULL;
