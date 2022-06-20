import fetch from "node-fetch";
import {
	CONTEMBER_CONTENT_URL,
	CONTEMBER_TOKEN,
	FRONTEND_URL,
} from "./config.js";
import { UKRAINIAN_CODE } from "./constant.js";
import { sendEmail } from "./email.js";
import { generateSecretCode } from "./utils.js";

const verifyUser = async (id: string, email: string) => {
	const secretCode = generateSecretCode();
	await sendEmail(email, "verification", {
		verificationUrl: `${FRONTEND_URL}/verify?id=${id}&secretCode=${secretCode}`,
		verificationUrlUk: `${FRONTEND_URL}/${UKRAINIAN_CODE}/verify?id=${id}&secretCode=${secretCode}`,
	});
	const response = await fetch(CONTEMBER_CONTENT_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${CONTEMBER_TOKEN}`,
		},
		body: JSON.stringify({
			query: `
					mutation ($id: UUID!, $secretCode: String!) {
						updateVolunteer(
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
	});

	if (!response.ok) {
		// console.log(await response.text());
		throw new Error(
			`Failed saving secret code from verification email: ${response.statusText}`
		);
	}
};

export const sendVerifications = async () => {
	const listResponse = await fetch(CONTEMBER_CONTENT_URL, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${CONTEMBER_TOKEN}`,
		},
		body: JSON.stringify({
			query: `
					{
						listVolunteer(
							filter: {
								and: [
									{ banned: { eq: false } }
									{ verified: { eq: false } }
									{ secretCode: { isNull: true } }
									{ identityId: { isNull: true } }
								]
							}
						) {
							id
							email
						}
					}
				`,
		}),
	});
	const listJson = listResponse.ok ? await listResponse.json() : undefined;
	const list: undefined | { id: string; email: string }[] = listJson
		? (listJson as any)?.data?.listVolunteer
		: undefined;

	for (const { id, email } of list) {
		try {
			console.log(`Sending verification email to ${email}`);
			await verifyUser(id, email);
		} catch (e) {
			console.error(
				`Failed sending verification email to ${email}: ${e.message}`
			);
		}
	}
};
