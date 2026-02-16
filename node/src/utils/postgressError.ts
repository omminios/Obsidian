import { PostgresError } from "../errors/index";

export function isPostgresError(e: unknown): e is PostgresError {
	return e instanceof Error && "code" in e;
}
