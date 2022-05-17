import crypto from "crypto";

export const generateSecretCode = (): string => {
	return crypto.randomBytes(16).toString('hex')
}

export function generateMutation(translations: { text: string, id: string }[]): string {
	let mutation = `mutation {`
	for (let index = 0; index < translations.length; index++) {
		mutation += `
			update_${index}: updateOfferParameterValue(by: {
				id: "${translations[index].id}" },
				data: { specificationUK: ${JSON.stringify(translations[index].text)} })
				{
					ok
					errorMessage
				}
		`
	}
	mutation += `}`
	return mutation
}
