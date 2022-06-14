import fetch from "node-fetch"
import { translate } from './utils/translate.js'
import { CONTEMBER_CONTENT_URL, CONTEMBER_TOKEN } from "./config.js"

export async function translateParameterValue() {
	const response = await fetch(CONTEMBER_CONTENT_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${CONTEMBER_TOKEN}`,
		},
		body: JSON.stringify({
			query: `
				query {
					translateCSUA: listOfferParameterValue(
						filter: {
							or: [
								{ and: { value: { isNull: false }, valueUK: { isNull: true } } }
								{
									and: {
										specification: { isNull: false }
										specificationUK: { isNull: true }
									}
								}
							]
						}
						limit: 10
					) {
						id
						specification
						value
					}
					translateUACS: listOfferParameterValue(
						filter: {
							or: [
								{ and: { value: { isNull: true }, valueUK: { isNull: false } } }
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
						specificationUK
						valueUK
					}
				}
			`,
		}),
	})

	const data = (await response.json() as any)?.data

	const translateCSUA = data?.translateCSUA
	console.log('Translate value CS: ', translateCSUA)

	const translateUACS = data?.translateUACS
	console.log('Translate value UA: ', translateUACS)

	if (translateCSUA.length) {
		translate(translateCSUA, 'OfferParameterValue')
	}
	if (translateUACS.length) {
		translate(translateUACS, 'OfferParameterValue')
	}
}



