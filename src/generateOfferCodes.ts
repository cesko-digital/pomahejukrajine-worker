import fetch from "node-fetch";
import { CONTEMBER_CONTENT_URL, CONTEMBER_TOKEN } from "./config.js";

const generateUniqueCode = (length: number): string => {
	let result = "";
	const characters = "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789";
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
};

const generateAndWriteCode = async (id: string) => {
	let result = false;
	let i = 1;

	do {
		i = i + 1;
		const codeToTest = generateUniqueCode(6);
		const response = await fetch(CONTEMBER_CONTENT_URL!, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${CONTEMBER_TOKEN}`,
			},
			body: JSON.stringify({
				query: `
						mutation ($id: UUID!, $code: String!) {
							updateOffer(
								by: { id: $id }
								data: { code: $code }
							) {
								ok
							}
						}
					`,
				variables: {
					id,
					code: codeToTest,
				},
			}),
		});
		result = response.ok;
	} while (!result && i < 10);
};

export const generateOfferCodes = async () => {
	const listResponse = await fetch(CONTEMBER_CONTENT_URL!, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${CONTEMBER_TOKEN}`,
		},
		body: JSON.stringify({
			query: `
					{
						listOffer(
							filter: {
								{ code: { isNull: true } }
							},
							limit: 10
						) {
							id
						}
					}
				`,
		}),
	});
	const listJson = listResponse.ok ? await listResponse.json() : undefined;
	const list: undefined | { id: string }[] = listJson
		? (listJson as any)?.data?.listOffer
		: undefined;

	console.log(listResponse)
	console.log(listJson)

	for (const { id } of list) {
		try {
			console.log(`Generating code for offer ${id}`);
			await generateAndWriteCode(id);
		} catch (e) {
			console.error(`Failed generating code for offer ${id}: ${e.message}`);
		}
	}
};
