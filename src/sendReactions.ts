import fetch from 'node-fetch';
import {CONTEMBER_CONTENT_URL, CONTEMBER_TOKEN, FRONTEND_URL} from "./config.js";
import {sendEmail} from "./email.js";
import {generateSecretCode} from "./utils";

type Reaction = {
	id: string
	email: string
	phone: string
	offer: { type: { name: string } }
	volunteer: { email: string }
}

const verifyReaction = async (reaction: Reaction) => {
	// const secretCode = generateSecretCode();
	await sendEmail(reaction.volunteer.email, "reaction", {
		email: reaction.email,
		phone: reaction.phone,
		offerTypeName: reaction.offer.type.name,
	});
	const response = await fetch(
		CONTEMBER_CONTENT_URL,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${CONTEMBER_TOKEN}`,
			},
			body: JSON.stringify({
				query: `
					mutation ($id: UUID!, $secretCode: String!) {
						updateReaction(
							by: { id: $id }
							data: { secretCode: $secretCode }
						) {
							ok
						}
					}
				`,
				variables: {
					id,
					secretCode,
				},
			}),
		}
	)

	if (!response.ok) {
		// console.log(await response.text());
		throw new Error(`Failed saving secret code from verification email: ${response.statusText}`)
	}
}

export const sendReactions = async () => {
	const listResponse = await fetch(
		CONTEMBER_CONTENT_URL,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${CONTEMBER_TOKEN}`,
			},
			body: JSON.stringify({
				query: `
					{
						listReaction(
							filter: {
								and: [
									{ verified: { eq: true } }
								]
							}
						) {
							id
							email
							phone
							offer { type { name } }
							volunteer { email }
						}
					}
				`
			}),
		}
	)
	const listJson = listResponse.ok ? await listResponse.json() : undefined
	const list: undefined | { id: string; email: string; }[] = listJson ? (listJson as any)?.data?.listReaction : undefined

	for (const { id, email } of list) {
		try {
			console.log(`Sending reaction verification email to ${email}`)
			await verifyReaction(id, email)
		} catch (e) {
			console.error(`Failed sending reaction verification email to ${email}: ${e.message}`)
		}
	}
}
