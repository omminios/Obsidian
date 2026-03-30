import { Request, Response, NextFunction } from "express";
import AuthorizationError from "../errors/authorizationError.js";

export const authorizeAdmin = (
	req: Request,
	_res: Response,
	next: NextFunction
) => {
	if (req.user?.role !== "admin") {
		throw new AuthorizationError("Admin access required");
	}
	next();
};
