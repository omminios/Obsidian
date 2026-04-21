import { pool } from "../config/database.js";
import { Tables } from "../config/types.js";
import { DatabaseError } from "../errors/index.js";
import { isPostgresError } from "../utils/postgressError.js";
import { ConflictError } from "../errors/index.js";

type Invitation = Tables<"invitations">;

export const createInvitation = async (
	inviterUserId: number,
	inviteeEmail: string,
	groupId: number,
	tokenHash: string,
	expiresAt: Date
): Promise<Invitation> => {
	try {
		const res = await pool.query(
			`INSERT INTO invitations (inviter_user_id, invitee_email, group_id, token, status, expires_at)
			VALUES ($1, $2, $3, $4, 'pending', $5)
			RETURNING *`,
			[inviterUserId, inviteeEmail, groupId, tokenHash, expiresAt]
		);
		return res.rows[0];
	} catch (e) {
		if (isPostgresError(e) && e.code === "23503") {
			throw new ConflictError("Referenced group or user does not exist", {
				constraint: e.constraint,
			});
		}
		throw new DatabaseError("Failed to create invitation", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const findValidInvitationByToken = async (
	tokenHash: string
): Promise<Invitation | undefined> => {
	try {
		const res = await pool.query(
			`SELECT * FROM invitations
			WHERE token = $1 AND status = 'pending' AND expires_at > NOW()`,
			[tokenHash]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to find invitation", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const findPendingInvitationForEmail = async (
	inviteeEmail: string,
	groupId: number
): Promise<Invitation | undefined> => {
	try {
		const res = await pool.query(
			`SELECT * FROM invitations
			WHERE invitee_email = $1 AND group_id = $2 AND status = 'pending' AND expires_at > NOW()`,
			[inviteeEmail, groupId]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to check existing invitation", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const updateInvitationStatus = async (
	invitationId: number,
	status: string,
	inviteeUserId?: number
): Promise<Invitation> => {
	try {
		const acceptedAt = status === "accepted" ? "NOW()" : "NULL";
		const res = await pool.query(
			`UPDATE invitations
			SET status = $1, invitee_user_id = COALESCE($2, invitee_user_id), accepted_at = ${acceptedAt}
			WHERE id = $3
			RETURNING *`,
			[status, inviteeUserId ?? null, invitationId]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to update invitation status", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const acceptInvitationAndJoinGroup = async (
	invitationId: number,
	groupId: number,
	userId: number
): Promise<void> => {
	const client = await pool.connect();
	try {
		await client.query("BEGIN");

		await client.query(
			`INSERT INTO group_memberships (group_id, user_id, role)
			VALUES ($1, $2, 'member')`,
			[groupId, userId]
		);

		await client.query(
			`UPDATE invitations
			SET status = 'accepted', invitee_user_id = $1, accepted_at = NOW()
			WHERE id = $2`,
			[userId, invitationId]
		);

		await client.query("COMMIT");
	} catch (e) {
		await client.query("ROLLBACK");
		throw new DatabaseError("Failed to accept invitation", {
			cause: e instanceof Error ? e.message : String(e),
		});
	} finally {
		client.release();
	}
};

export const invalidatePendingInvitation = async (
	inviteeEmail: string,
	groupId: number
): Promise<Invitation | undefined> => {
	try {
		const res = await pool.query(
			`UPDATE invitations
			SET status = 'invalidated'
			WHERE invitee_email = $1 AND group_id = $2 AND status = 'pending'
			RETURNING *`,
			[inviteeEmail, groupId]
		);
		return res.rows[0];
	} catch (e) {
		throw new DatabaseError("Failed to invalidate invitation", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};

export const purgeExpiredInvitations = async (): Promise<number> => {
	try {
		const res = await pool.query(
			`DELETE FROM invitations
			WHERE (status IN ('accepted', 'declined', 'invalidated') OR expires_at < NOW())
			AND GREATEST(
				expires_at,
				COALESCE(accepted_at, expires_at)
			) < NOW() - INTERVAL '7 days'`
		);
		return res.rowCount ?? 0;
	} catch (e) {
		throw new DatabaseError("Failed to purge expired invitations", {
			cause: e instanceof Error ? e.message : String(e),
		});
	}
};
