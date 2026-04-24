-- Revoke all active refresh tokens when a user's password changes.
-- Fires AFTER UPDATE so the new password is already committed.
-- Only acts when password_hash actually changed (avoids no-op updates).

CREATE OR REPLACE FUNCTION revoke_sessions_on_password_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.password_hash IS DISTINCT FROM NEW.password_hash THEN
        UPDATE refresh_tokens
        SET revoked_at = NOW()
        WHERE user_id = NEW.id AND revoked_at IS NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_revoke_sessions_on_password_change
    AFTER UPDATE OF password_hash ON users
    FOR EACH ROW
    EXECUTE FUNCTION revoke_sessions_on_password_change();
