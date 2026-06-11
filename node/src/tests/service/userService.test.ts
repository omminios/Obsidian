import { describe, it, expect, beforeEach } from "vitest";
import { truncateAll, seedUser, seedGroup, pool } from "../helpers/dbHelper.js";
import { removeUser } from "../../services/userServices.js";
import { findById } from "../../repository/userRepository.js";
import { ConflictError, NotFoundError } from "../../errors/index.js";

// Add a second active member to an existing group (no helper exists for this —
// seedGroup only inserts the creator membership).
async function addMember(groupId: number, userId: number) {
	await pool.query(
		`INSERT INTO group_memberships (group_id, user_id, role)
		VALUES ($1, $2, 'member')`,
		[groupId, userId]
	);
}

async function groupExists(groupId: number): Promise<boolean> {
	const res = await pool.query("SELECT 1 FROM groups WHERE id = $1", [groupId]);
	return res.rows.length > 0;
}

// Exercises the account-deletion guard in removeUser. A household creator with
// other members is blocked; a solo creator deletes cleanly and their orphan
// personal group is cleaned up; a non-creator member departs without touching
// the household's group.
describe("userServices.removeUser", () => {
	beforeEach(async () => {
		await truncateAll();
	});

	it("blocks a creator who still has other members in the household", async () => {
		const owner = await seedUser();
		const group = await seedGroup(owner.id);
		const other = await seedUser({
			email: "member@example.com",
			username: "member",
		});
		await addMember(group.id, other.id);

		await expect(removeUser(owner.id)).rejects.toThrow(ConflictError);

		// The user must survive a blocked delete.
		expect(await findById(owner.id)).toBeDefined();
	});

	it("deletes a solo creator and removes their now-empty personal group", async () => {
		const user = await seedUser();
		const group = await seedGroup(user.id);

		const deleted = await removeUser(user.id);

		expect(deleted.id).toBe(user.id);
		expect(await findById(user.id)).toBeUndefined();
		expect(await groupExists(group.id)).toBe(false);
	});

	it("lets a non-creator member delete without deleting the household group", async () => {
		const owner = await seedUser();
		const group = await seedGroup(owner.id);
		const member = await seedUser({
			email: "member@example.com",
			username: "member",
		});
		await addMember(group.id, member.id);

		await removeUser(member.id);

		expect(await findById(member.id)).toBeUndefined();
		// The owner and their group are untouched.
		expect(await findById(owner.id)).toBeDefined();
		expect(await groupExists(group.id)).toBe(true);
	});

	it("throws NotFoundError when the user does not exist", async () => {
		await expect(removeUser(999999)).rejects.toThrow(NotFoundError);
	});
});
