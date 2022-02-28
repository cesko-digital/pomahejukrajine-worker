import crypto from "crypto";

export const generateSecretCode = (): string => {
	return crypto.randomBytes(16).toString('hex')
}
