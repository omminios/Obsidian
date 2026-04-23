import nodemailer from "nodemailer";

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
	if (!process.env.SMTP_HOST) {
		throw new Error("SMTP_HOST environment variable is not defined");
	}
	if (!process.env.SMTP_PORT) {
		throw new Error("SMTP_PORT environment variable is not defined");
	}
	if (!process.env.EMAIL_FROM) {
		throw new Error("EMAIL_FROM environment variable is not defined");
	}
}

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST || "127.0.0.1",
	port: Number(process.env.SMTP_PORT) || 54325,
	secure: isProduction,
	...(isProduction && {
		auth: {
			user: process.env.SMTP_USER,
			pass: process.env.SMTP_PASS,
		},
	}),
});

const EMAIL_FROM = process.env.EMAIL_FROM || "noreply@obsidian.local";

export { transporter, EMAIL_FROM };
