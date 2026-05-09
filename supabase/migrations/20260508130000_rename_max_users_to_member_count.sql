ALTER TABLE groups RENAME COLUMN max_users TO member_count;

ALTER TABLE groups RENAME CONSTRAINT groups_max_users_check TO groups_member_count_check;
