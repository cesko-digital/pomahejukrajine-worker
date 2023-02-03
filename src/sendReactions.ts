import fetch from 'node-fetch';
import {CONTEMBER_CONTENT_URL, CONTEMBER_TOKEN, FRONTEND_URL} from "./config.js";
import {sendEmail} from "./email.js";

type Reaction = {
	id: string
	email: string
	phone: string
	offer: {
		type: { name: string }
		volunteer: { email: string }
	}
}

const sendReaction = async (reaction: Reaction) => {
	await sendEmail(reaction.offer.volunteer.email, "reaction", {
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
					mutation ($id: UUID!) {
						updateReaction(
							by: { id: $id }
							data: { volunteerNotified: true }
						) {
							ok
						}
					}
				`,
				variables: {
					id: reaction.id,
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
									{ volunteerNotified: { eq: false } }
								]
							}
						) {
							id
							email
							phone
							text
							offer {
								type { name }
								volunteer { email }
							}
						}
					}
				`
			}),
		}
	)

	const listJson = listResponse.ok ? await listResponse.json() : undefined
	const list: undefined | Reaction[] = listJson ? (listJson as any)?.data?.listReaction : undefined

	for (const reaction of list) {
		try {
			console.log(`Sending reaction ${reaction.id}`)
			await sendReaction(reaction)
		} catch (e) {
			console.error(`Failed sending reaction ${reaction.id}: ${e.message}`)
		}
	}
}
