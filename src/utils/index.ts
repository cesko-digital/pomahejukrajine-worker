import crypto from "crypto"

export const generateSecretCode = (): string => {
	return crypto.randomBytes(16).toString('hex')
}

export async function retry<T>(count: number, fn: () => Promise<T>): Promise<T> {
	try {
		return await fn()
	} catch (e) {
		console.log(`Retry ${count}`)
		if (count > 0) {
			return retry(count - 1, fn)
		} else {
			throw e
		}
	}
}

