import { CONTEMBER_CONTENT_URL, CONTEMBER_TOKEN } from '../config.js'

const parseTranslation = async (id: string, value: string, field: string, isUk?: boolean) => {
	if (!value.trim().length) {
		console.log('Skipping empty translation request.', value)
		return ({ translation: { [field]: value }, id })
	}

	const params = new URLSearchParams()
	params.append('input_text', value)

	console.log('Sending CS translation request for ', id)
	const result = await translateText(value, { isUk })

	if (!result.ok) {
		console.error('Failed to translate: ', id, result)
		return
	}

	const json = await result.json() as string[]
	return ({ translation: { [field]: json.join(' ') }, id })
}

export function generateMutation(translations: { translation: { specification?: string }, id: string }[], isValue: boolean): string {
	let mutation = `mutation {`
	for (let index = 0; index < translations.length; index++) {
		const key = Object.keys(translations[index].translation)[0]
		mutation += `
			update_${index}: updateOfferParameter${isValue ? 'Value' : ''}(
				by: { id: "${translations[index].id}" },
				data: { ${key}: ${JSON.stringify(translations[index].translation[key])} }
				) {
					ok
					errorMessage
				}
		`
	}
	mutation += `}`
	return mutation
}

export async function translateText(text: string, options: { isUk: boolean }) {
	const params = new URLSearchParams()
	const translate = options.isUk ? { from: 'uk', to: 'cs' } : { from: 'cs', to: 'uk' }

	params.append('input_text', text)

	return fetch(`https://lindat.cz/translation/api/v2/languages/?src=${translate.from}&tgt=${translate.to}&logInput=true&author=PomahejUkrajine`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded',
			'Accept': 'application/json'
		},
		body: params
	})
}

export async function saveTranslations(translations: { translation: { specification?: string }, id: string }[], isValue: boolean) {
	const mutation = generateMutation(translations, isValue)
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

export async function doTranslate(listForTranslate, isValue: boolean) {
	const translations = []
	for (const { id, specification, value, specificationUk, valueUK } of listForTranslate) {
		if (specification) {
			translations.push(await parseTranslation(id, specification, 'specificationUK'))
		}
		if (value) {
			translations.push(await parseTranslation(id, value, 'valueUK'))
		}
		if (specificationUk) {
			translations.push(await parseTranslation(id, specificationUk, 'specification', true))
		}
		if (valueUK) {
			translations.push(await parseTranslation(id, valueUK, 'value', true))
		}
	}


	saveTranslations(translations, isValue)
}
