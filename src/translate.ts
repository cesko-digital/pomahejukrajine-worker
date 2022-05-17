import fetch from "node-fetch"
import { XMLHttpRequest } from "xmlhttprequest"
import {
	CONTEMBER_CONTENT_URL,
	CONTEMBER_TOKEN,
} from "./config.js"

export async function translate() {
	const response = await fetch(CONTEMBER_CONTENT_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${CONTEMBER_TOKEN}`,
		},
		body: JSON.stringify({
			query: `
				query {
					listOfferParameterValue(
						filter: { specification: { isNull: false } and: { specificationUK: { isNull: true } } },
						limit: 10
					) {
						id
						specification
					}
				}
			`,
		}),
	})
	const thingsToTranslate = (await response.json() as any)?.data?.listOfferParameterValue
	console.log('Translate: ', thingsToTranslate)

	if (!thingsToTranslate.length) return

	console.log('Sending translation requests...')
	for (const { id, specification } of thingsToTranslate) {
		if (!/\s/.test(specification)) {
			const result = await fetch('https://lindat.cz/translation/api/v2/languages/?src=cs&tgt=uk&logInput=true&author=PomahejUkrajine', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json'
				},
				body: "input_text=" + specification,
			})

			if (!result.ok) console.error('Failed to translate: ', id, result)

			const json = await result.json()
			console.log('json', json)

			saveTranslation(json[0], id)
		} else {
			saveTranslation(specification, id)
		}

	}
}

const saveTranslation = async (translation: String, translationID: String) => {
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
					mutation($data: String, $id: UUID!) {
						updateOfferParameterValue(
							by: { id: $id }
							data: {
								specificationUK: $data
							}
						) {
							ok
							errorMessage
						}
					}
				`,
				variables: {
					data: translation,
					id: translationID,
				},
			}),
		}
	)

	if (response.ok) {
		console.log('Saved translation.')
	} else {
		console.error('Failed to save translation: ', response)
	}

	return
}
