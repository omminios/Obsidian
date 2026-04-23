import crypto from "crypto";
import { hashToken } from "../utils/hashing.js";
import { findById } from "../repository/userRepository.js";
import {
	createInvitation,
	findValidInvitationByToken,
	findPendingInvitationForEmail,
	invalidatePendingInvitation,
	acceptInvitationAndJoinGroup,
	updateInvitationStatus,
	purgeExpiredInvitations,
} from "../repository/invitationRepository.js";
import {
	findActiveMembership,
	findById as findGroupById,
} from "../repository/groupRepository.js";
import {
	AuthorizationError,
	ConflictError,
	NotFoundError,
	AuthenticationError,
} from "../errors/index.js";

const INVITATION_EXPIRES_DAYS = 7;

interface InvitationResult {
	token: string;
	invitationId: number;
	inviterName: string;
	groupName: string;
}

export const sendInvitation = async (
	inviterUserId: number,
	inviterGroupId: number | null,
	inviterRole: string | null,
	inviteeEmail: string
): Promise<InvitationResult> => {
	if (!inviterGroupId || !inviterRole) {
		throw new AuthorizationError(
			"You must create a group before you can invite members"
		);
	}

	if (inviterRole !== "creator" && inviterRole !== "admin") {
		throw new AuthorizationError(
			"Only group creators or admins can send invitations"
		);
	}

	const existing = await findPendingInvitationForEmail(
		inviteeEmail,
		inviterGroupId
	);
	if (existing) {
		await invalidatePendingInvitation(inviteeEmail, inviterGroupId);
	}

	const [inviter, group] = await Promise.all([
		findById(inviterUserId),
		findGroupById(inviterGroupId),
	]);

	const rawToken = crypto.randomBytes(32).toString("hex");
	const tokenHash = hashToken(rawToken);

	const expiresAt = new Date();
	expiresAt.setDate(expiresAt.getDate() + INVITATION_EXPIRES_DAYS);

	const invitation = await createInvitation(
		inviterUserId,
		inviteeEmail,
		inviterGroupId,
		tokenHash,
		expiresAt
	);

	return {
		token: rawToken,
		invitationId: invitation.id,
		inviterName: `${inviter!.first_name} ${inviter!.last_name}`,
		groupName: group!.name,
	};
};

export const acceptInvitation = async (
	token: string,
	acceptingUserId: number
): Promise<void> => {
	const tokenHash = hashToken(token);
	const invitation = await findValidInvitationByToken(tokenHash);

	if (!invitation) {
		throw new AuthenticationError("Invalid or expired invitation token");
	}

	const user = await findById(acceptingUserId);
	if (!user) {
		throw new NotFoundError("User", String(acceptingUserId));
	}

	if (invitation.invitee_email !== user.email) {
		throw new AuthorizationError(
			"This invitation was not sent to your email address"
		);
	}

	const existingMembership = await findActiveMembership(acceptingUserId);
	if (existingMembership) {
		throw new ConflictError("You are already a member of a group");
	}

	await acceptInvitationAndJoinGroup(
		invitation.id,
		invitation.group_id!,
		acceptingUserId
	);
};

export const declineInvitation = async (
	token: string,
	decliningUserId: number
): Promise<void> => {
	const tokenHash = hashToken(token);
	const invitation = await findValidInvitationByToken(tokenHash);

	if (!invitation) {
		throw new AuthenticationError("Invalid or expired invitation token");
	}

	const user = await findById(decliningUserId);
	if (!user) {
		throw new NotFoundError("User", String(decliningUserId));
	}

	if (invitation.invitee_email !== user.email) {
		throw new AuthorizationError(
			"This invitation was not sent to your email address"
		);
	}

	await updateInvitationStatus(invitation.id, "declined");
};

export { purgeExpiredInvitations };
