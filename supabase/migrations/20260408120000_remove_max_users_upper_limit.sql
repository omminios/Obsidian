-- Remove the upper bound (max 8) on max_users, keep the lower bound (min 1)
ALTER TABLE groups
  DROP CONSTRAINT groups_max_users_check,
  ADD CONSTRAINT groups_max_users_check CHECK (max_users >= 1);
