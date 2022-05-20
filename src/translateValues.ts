import fetch, { } from "node-fetch"
import { generateMutationValues } from './utils.js'
import {
	CONTEMBER_CONTENT_URL,
	CONTEMBER_TOKEN,
} from "./config.js"

export async function translateValues() {
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
						filter: {
							and: {
								value: { isNull: false }
								valueUK: { isNull: true }
							}
						}
						limit: 10
					) {
						id
						value
					}
				}
			`,
		}),
	})
	const thingsToTranslate = (await response.json() as any)?.data?.listOfferParameterValue
	console.log('Translate: ', thingsToTranslate)

	if (!thingsToTranslate.length) return

	const translations = []
	for (const { id, value } of thingsToTranslate) {
		if (!value.trim().length) {
			console.log('Skipping empty translation request.', value)
			translations.push({ text: value, id })
		} else {
			const params = new URLSearchParams()
			params.append('input_text', value)

			console.log('Sending translation request for ', id)
			const result = await fetch('https://lindat.cz/translation/api/v2/languages/?src=cs&tgt=uk&logInput=true&author=PomahejUkrajine', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Accept': 'application/json'
				},
				body: params
			})

			if (!result.ok) {
				console.error('Failed to translate: ', id, result)
				return
			}

			const json = await result.json()
			translations.push({ text: json[0], id })
		}
	}

	saveTranslations(translations)
}

const saveTranslations = async (translations: { text: string, id: string }[]) => {
	const mutation = generateMutationValues(translations)
	const response = await fetch(
		CONTEMBER_CONTENT_URL,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${CONTEMBER_TOKEN}`,
			},
			body: JSON.stringify({
				query: mutation,
			}),
		}
	)

	if (response.ok) {
		console.log('Translations saved.')
	} else {
		console.error('Translations failed to save: ', response)
	}

	return
}
