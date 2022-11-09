import fetch from "node-fetch"
import { CONTEMBER_CONTENT_URL, CONTEMBER_TOKEN } from '../config.js'

export type Translations = {
	field: string,
	translatedValue: string,
	id: string
}[]

function generateMutation(translations: Translations, entityName: string): string {
	let mutation = `mutation {`
	for (let index = 0; index < translations.length; index++) {
		const key = translations[index].field
		mutation += `
			update_${index}: update${entityName}(
				by: { id: "${translations[index].id}" },
				data: { ${key}: ${JSON.stringify(translations[index].translatedValue)} }
				) {
					ok
					errorMessage
				}
		`
	}
	mutation += `}`
	return mutation
}

async function translateText(text: string, language: 'cs' | 'uk'): Promise<string | null> {
	if (!text.trim().length) {
		console.log('Skipping empty translation request.', text)
		return text
	}

	const params = new URLSearchParams()
	const translate = language === 'uk' ? { from: 'uk', to: 'cs' } : { from: 'cs', to: 'uk' }

	params.append('input_text', text)

	const result = await fetch(`https://lindat.cz/translation/api/v2/languages/?src=${translate.from}&tgt=${translate.to}&logInput=true&author=PomahejUkrajine`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json'
		},
		body: params
	})

	if (!result.ok) {
		console.error('Failed to translate: ', text, result)
		return null
	}

	const json = await result.json() as string[]
	console.log(json)
	return json.join(' ')
}

export async function saveTranslations(translations: Translations, entityName: string) {
	const mutation = generateMutation(translations, entityName)
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
		console.error('Translations failed to save: ', { error: await response.text(), mutation })
	}
}

export type ListForTranslate = {
	id: string,
	value?: string
	valueUK?: string
	specification?: string
	specificationUK?: string
}[]

export async function translate(listForTranslate: ListForTranslate, entityName: string) {
	const translations = []
	for (const { id, specification, value, specificationUK, valueUK } of listForTranslate) {
		if (typeof specification === 'string' && specificationUK === null) {
			translations.push({ field: 'specificationUK', translatedValue: await translateText(specification, 'cs'), id })
		}
		if (typeof value === 'string' && valueUK === null) {
			translations.push({ field: 'valueUK', translatedValue: await translateText(value, 'cs'), id })
		}
		if (typeof specificationUK === 'string' && specification === null) {
			translations.push({ field: 'specification', translatedValue: await translateText(specificationUK, 'uk'), id })
		}
		if (typeof valueUK === 'string' && value === null) {
			translations.push({ field: 'value', translatedValue: await translateText(valueUK, 'uk'), id })
		}
	}
	saveTranslations(translations, entityName)
}
