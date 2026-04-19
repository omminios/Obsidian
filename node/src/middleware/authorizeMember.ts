import { Request, Response, NextFunction } from "express";
import AuthorizationError from "../errors/authorizationError.js";

export const authorizeMember = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	const role = req.user?.role;
	if (role !== "member" && role !== "creator" && role !== "admin") {
		throw new AuthorizationError("Group membership required");
	}
	next();
};
