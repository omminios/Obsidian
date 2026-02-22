import * as argon2 from "argon2";

const default_options = {
	type: argon2.argon2id,
	memoryCost: 65536,
	timeCost: 2,
	parallelism: 4,
};

export async function hashPassword(
	password: string,
	options = default_options
): Promise<string> {
	return argon2.hash(password, options);
}
