import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

if (!process.env.plaid_client_id) {
	throw new Error("plaid_client_id environment variable is not defined");
}
if (!process.env.plaid_sandbox_secret) {
	throw new Error("plaid_sandbox_secret environment variable is not defined");
}

const configuration = new Configuration({
	basePath: PlaidEnvironments.sandbox,
	baseOptions: {
		headers: {
			"PLAID-CLIENT-ID": process.env.plaid_client_id,
			"PLAID-SECRET": process.env.plaid_sandbox_secret,
		},
	},
});

export const plaidClient = new PlaidApi(configuration);
