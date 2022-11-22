import Typesense from 'typesense'
import fetch from "node-fetch"
import {
	CONTEMBER_CONTENT_URL,
	CONTEMBER_TOKEN,
	TYPESENSE_API_KEY,
	TYPESENSE_HOST,
	TYPESENSE_PORT,
	TYPESENSE_PROTOCOL
} from "./config.js"
import { Collection, indexAllOfferTypesToTypesense } from "./indexingUtils.js"

const client = TYPESENSE_HOST && new Typesense.Client({
	'nodes': [{
		'host': TYPESENSE_HOST,
		'port': TYPESENSE_PORT,
		'protocol': TYPESENSE_PROTOCOL,
	}],
	'apiKey': TYPESENSE_API_KEY,
	'connectionTimeoutSeconds': 10
})

export async function indexToTypesense() {
	await indexAllOfferTypesToTypesense(client, async (offerTypeId: string, collection: Collection) => {
		await indexOfferType(offerTypeId, collection)
	})
}

async function indexOfferType(offerTypeId: string, collection: Collection) {
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
					query($offerTypeId: UUID!) {
						listOffer(filter: {
							type: {id: {eq: $offerTypeId}}
							exhausted: { eq: false }
							status: { type: { isNull: true } }
							isDeleted: { eq: false }
							volunteer: {
								verified: { eq: true }
								banned: { eq: false }
							}
						}) {
							id
							volunteer {
								name
								email
								phone
							}
							logs { text }
							status {
								id
								name
							}
							parameters {
								question {
									id
									type
								}
								value
								numericValue
								specification
								values {
									value
									numericValue
									specification
									district { name }
								}
							}
						}
					}
				`,
				variables: {
					offerTypeId,
				},
			}),
		}
	)

	const listOfferResponse = await response.json() as any
	const offers = listOfferResponse?.data?.listOffer

	if (!offers || !Array.isArray(offers)) {
		throw new Error(`Error while fetching offers ${JSON.stringify(listOfferResponse)}`)
	}

	const documents = offers.map((it: any) => offerToDocument(it))
	const importResponses = await collection.documents().import(documents, { action: 'upsert' })

	const errors = importResponses.filter(it => !it.success)
	if (errors.length > 0) {
		console.error(`Error while indexing offers: ${JSON.stringify(errors)}`)
	}
}

function offerToDocument(offer: any) {
	return {
		id: offer.id,
		volunteer_name: offer.volunteer.name,
		volunteer_email: offer.volunteer.email,
		volunteer_phone: offer.volunteer.phone,
		logs: offer.logs.map((it: any) => it.text),
		...Object.fromEntries(
			offer.parameters
				.map((parameter: any) => [`parameter_${parameter.question.id}`, parameterToDocumentValue(parameter)])
		),
		...Object.fromEntries(
			offer.parameters
				.filter(it => ["checkbox", "radio", "district"].includes(it.question.type))
				.map((parameter: any) => {
					if(parameterToFacetValue(parameter) == "Celá ČR") {
						[
							`parameter_${parameter.question.id}_facet`, "Celá ČR",
							`parameter_${parameter.question.id}_facet`, "Hlavní město Praha",
							`parameter_${parameter.question.id}_facet`, "Středočeský kraj",
							`parameter_${parameter.question.id}_facet`, "Jihomoravský kraj",
							`parameter_${parameter.question.id}_facet`, "Moravskoslezský kraj",
							`parameter_${parameter.question.id}_facet`, "Ústecký kraj",
							`parameter_${parameter.question.id}_facet`, "Plzeňský kraj",
							`parameter_${parameter.question.id}_facet`, "Královéhradecký kraj",
							`parameter_${parameter.question.id}_facet`, "Jihočeský kraj",
							`parameter_${parameter.question.id}_facet`, "Olomoucký kraj",
							`parameter_${parameter.question.id}_facet`, "Zlínský kraj",
							`parameter_${parameter.question.id}_facet`, "Pardubický kraj",
							`parameter_${parameter.question.id}_facet`, "Kraj Vysočina",
							`parameter_${parameter.question.id}_facet`, "Liberecký kraj",
							`parameter_${parameter.question.id}_facet`, "Karlovarský kraj"
						]
					} else {
						[`parameter_${parameter.question.id}_facet`, parameterToFacetValue(parameter)]
					}
				})
		),
		status_name: offer.status?.name,
		status_name_facet: offer.status?.name,
	}
}

function parameterToDocumentValue(parameter: any) {
	switch (parameter.question.type) {
		case 'radio':
			return parameter.specification ? `${parameter.value} (${parameter.specification})` : parameter.value
		case 'checkbox':
			return parameter.values.map((it: any) => it.specification ? `${it.value} (${it.specification})` : it.value)
		case 'text':
			return parameter.value
		case 'textarea':
			return parameter.value
		case 'number':
			return parameter.numericValue ?? parseInt(parameter.value, 10)
		case 'date':
			return parameter.value
		case 'district':
			return parameter.values.map((it: any) => it.district?.name ?? it.value)
		case 'image':
			return parameter.value
		default:
			return undefined
	}
}


function parameterToFacetValue(parameter: any) {
	switch (parameter.question.type) {
		case 'radio':
			return parameter.value
		case 'checkbox':
			return parameter.values.map((it: any) => it.value)
		case 'district':
			return parameter.values.map((it: any) => it.district?.name ?? it.value)
		case 'image':
			return parameter.value
		default:
			return undefined
	}
}
