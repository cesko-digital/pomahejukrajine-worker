import fetch from "node-fetch"
import { translate } from './utils/translate.js'
import { CONTEMBER_CONTENT_URL, CONTEMBER_TOKEN } from "./config.js"

export async function translateParameters(entityName: 'OfferParameterValue' | 'OfferParameter') {
	const response = await fetch(CONTEMBER_CONTENT_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${CONTEMBER_TOKEN}`,
		},
		body: JSON.stringify({
			query: `
				query {
					parametersToTranslate: list${entityName}(
						filter: {
							or: [
								{
									and: {
										value: { isNull: false }
										valueUK: { isNull: true }
									}
								}
								{
									and: {
										specification: { isNull: false }
										specificationUK: { isNull: true }
									}
								}
								{
									and: {
										value: { isNull: true }
										valueUK: { isNull: false }
									}
								}
								{
									and: {
										specification: { isNull: true }
										specificationUK: { isNull: false }
									}
								}
							]
						}
						limit: 10
					) {
						id
						value
						specification
						specificationUK
						valueUK
					}
				}
			`,
		}),
	})

	if (!response.ok) {
		console.error('Failed to get parameters to translate: ', await response.text())
		return
	}

	const data = (await response.json() as any)?.data
	const parametersToTranslate = data?.parametersToTranslate

	if (parametersToTranslate.length) {
		translate(parametersToTranslate, entityName)
	}
}



