import Typesense from 'typesense'
import fetch from "node-fetch"
import {
	CONTEMBER_CONTENT_URL,
	CONTEMBER_TOKEN,
	TYPESENSE_API_KEY_PUBLIC,
	TYPESENSE_HOST_PUBLIC,
	TYPESENSE_PORT_PUBLIC,
	TYPESENSE_PROTOCOL_PUBLIC
} from "./config.js"
import {Collection, indexAllOfferTypesToTypesense} from "./indexingUtils.js";

const client = TYPESENSE_HOST_PUBLIC && new Typesense.Client({
	'nodes': [{
		'host': TYPESENSE_HOST_PUBLIC,
		'port': TYPESENSE_PORT_PUBLIC,
		'protocol': TYPESENSE_PROTOCOL_PUBLIC,
	}],
	'apiKey': TYPESENSE_API_KEY_PUBLIC,
	'connectionTimeoutSeconds': 10
})

export async function indexToTypesensePublic() {
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
							type: { id: { eq: $offerTypeId } }
							exhausted: { eq: false }
							status: { type: { isNull: true } }
							isDeleted: { eq: false }
							volunteer: {
								verified: { eq: true }
								banned: { eq: false }
							}
						}) {
							id
							code
							parameters(filter: { question: { public: { eq:  true } } }){
								question {
									id
									type
								}
								value
								valueUK
								specification
								specificationUK
								values {
									value
									valueUK
									specification
									specificationUK
									district {
										name
										nameUK
										region {
											name
											nameUK
										}
									}
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
		code: offer.code,
		...Object.fromEntries(
			offer.parameters
				.flatMap((parameter: any) => [
					[`parameter_${parameter.question.id}`, parameterToDocumentValue(parameter)],
					[`parameter_uk_${parameter.question.id}`, parameterToUkDocumentValue(parameter)],
				])
		),
		...Object.fromEntries(
			offer.parameters
				.filter(it => ["checkbox", "radio", "district"].includes(it.question.type))
				.flatMap((parameter: any) => [
					[`parameter_${parameter.question.id}_facet`, parameterToFacetValue(parameter)],
					[`parameter_uk_${parameter.question.id}_facet`, parameterToUkFacetValue(parameter)],
					...((parameter.question.type === "district" && parameter.values.every(it => it.district != null)) ? [
						...(parameter.values.district.includes('Celá ČR')) ? [
							[`parameter_${parameter.question.id}_region_facet`, ["Hlavní město Praha", "Středočeský kraj", "Jihočeský kraj", "Plzeňský kraj", "Karlovarský kraj", "Ústecký kraj", "Liberecký kraj", "Královéhradecký kraj", "Pardubický kraj", "Kraj Vysočina", "Jihomoravský kraj", "Olomoucký kraj", "Zlínský kraj", "Moravskoslezský kraj"]],
							[`parameter_uk_${parameter.question.id}_region_facet`, parameter.values.map(it => it.district?.region.nameUK)],
						] : [
							[`parameter_${parameter.question.id}_region_facet`, parameter.values.map(it => it.district?.region.name)],
							[`parameter_uk_${parameter.question.id}_region_facet`, parameter.values.map(it => it.district?.region.nameUK)],
						]
					]: []),
				])
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

function parameterToUkDocumentValue(parameter: any) {
	switch (parameter.question.type) {
		case 'radio':
			return parameter.specificationUK ? `${parameter.valueUK} (${parameter.specificationUK})` : parameter.valueUK
		case 'checkbox':
			return parameter.values.map((it: any) => it.specificationUK ? `${it.valueUK} (${it.specificationUK})` : it.valueUK).filter(it => it !== null)
		case 'text':
			return parameter.valueUK
		case 'textarea':
			return parameter.valueUK
		case 'number':
			return parameter.numericValue ?? parseInt(parameter.value, 10)
		case 'date':
			return parameter.value
		case 'district':
			return parameter.values.map((it: any) => it.district?.nameUK ?? it.value)
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

function parameterToUkFacetValue(parameter: any) {
	switch (parameter.question.type) {
		case 'radio':
			return parameter.valueUK
		case 'checkbox':
			return parameter.values.map((it: any) => it.valueUK).filter(it => it != null)
		case 'district':
			return parameter.values.map((it: any) => it.district?.nameUK ?? it.value).filter(it => it != null)
		default:
			return undefined
	}
}
