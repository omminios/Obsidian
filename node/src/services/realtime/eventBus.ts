import type { Response } from "express";

// groupId -> set of open SSE responses. In-memory, so this is single-instance
// only: a sync on one process can only reach clients connected to that same
// process. Scaling the backend horizontally would need Redis pub/sub (or
// Postgres LISTEN/NOTIFY) to fan events out across instances.
const groupClients = new Map<number, Set<Response>>();

// Register an open SSE connection under its group.
export function addClient(groupId: number, res: Response): void {
	let set = groupClients.get(groupId);
	if (!set) {
		set = new Set();
		groupClients.set(groupId, set);
	}
	set.add(res);
}

// Drop a connection (browser closed/navigated away) and clean up empty buckets.
export function removeClient(groupId: number, res: Response): void {
	const set = groupClients.get(groupId);
	if (!set) return;
	set.delete(res);
	if (set.size === 0) groupClients.delete(groupId);
}

// Broadcast a named event to every open client in a group. No-op if nobody in
// the group has the dashboard open.
export function publishToGroup(
	groupId: number,
	event: string,
	data: unknown
): void {
	const set = groupClients.get(groupId);
	if (!set || set.size === 0) return;

	const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
	for (const res of set) {
		res.write(payload);
	}
}

// Close every open stream — called from the server's graceful shutdown so
// held-open connections don't keep the process alive.
export function closeAllClients(): void {
	for (const set of groupClients.values()) {
		for (const res of set) res.end();
	}
	groupClients.clear();
}
