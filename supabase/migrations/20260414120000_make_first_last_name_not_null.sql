-- Make first_name and last_name required on the users table
ALTER TABLE users
    ALTER COLUMN first_name SET NOT NULL,
    ALTER COLUMN last_name SET NOT NULL;
