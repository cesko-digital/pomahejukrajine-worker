import Typesense from 'typesense'
import fetch from "node-fetch";
import {
	CONTEMBER_CONTENT_URL,
	CONTEMBER_TOKEN,
	TYPESENSE_API_KEY,
	TYPESENSE_HOST,
	TYPESENSE_PORT,
	TYPESENSE_PROTOCOL
} from "./config.js";

const client = TYPESENSE_HOST && new Typesense.Client({
	'nodes': [{
		'host': TYPESENSE_HOST,
		'port': TYPESENSE_PORT,
		'protocol': TYPESENSE_PROTOCOL,
	}],
	'apiKey': TYPESENSE_API_KEY,
	'connectionTimeoutSeconds': 2
})

async function retry(count: number, fn: () => Promise<any>): Promise<any> {
	try {
		return await fn()
	} catch (e) {
		console.log(`Retry ${count}`)
		if (count > 0) {
			return retry(count - 1, fn)
		} else {
			throw e
		}
	}
}

export async function indexToTypesense() {
	const collections = await client.collections().retrieve()
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
					{
						listOfferType {
							id
						}
					}
				`,
			}),
		}
	)

	const offerTypes = (await response.json() as any)?.data?.listOfferType

	if (!offerTypes || !Array.isArray(offerTypes)) {
		throw new Error('Error while fetching offer types')
	}
	for (const offerType of offerTypes) {
		const offerTypeId = offerType.id
		const collectionName = `offers_${offerTypeId}`
		const collection = collections.find(it => it.name === collectionName)
		if (!collection) {
			await client.collections().create({
				name: collectionName,
				fields: [
					{
						name: '.*',
						type: 'auto',
					},
					{
						"name": ".*_facet",
						"type": "auto",
						"facet": true,
					},
				],
			})
		}
		try {
			await retry(5, async () => {
				await indexOfferType(offerTypeId)
			})
		} catch (e) {
			console.error(`Error while indexing offer type ${offerTypeId}`, e)
		}
	}
}

async function indexOfferType(offerTypeId: string) {
	const collectionName = `offers_${offerTypeId}`
	const collection = client.collections(collectionName)
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
						listOffer(filter: {type: {id: {eq: $offerTypeId}}}
							limit: 6000
							) {
							id
							volunteer {
								name
								email
								phone
							}
							logs { text }
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

	const listOfferResponse = await response.json() as any;
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
				.map((parameter: any) => [`parameter_${parameter.question.id}_facet`, parameterToFacetValue(parameter)])
		),
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
		default:
			return undefined
	}
}
