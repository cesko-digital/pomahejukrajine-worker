import fetch from "node-fetch";
import {CONTEMBER_CONTENT_URL, CONTEMBER_TOKEN} from "./config.js";
import {retry} from "./utils/index.js";
import {Client} from "typesense";

export type Collection = ReturnType<(typeof Client)["prototype"]["collections"]>

export async function indexAllOfferTypesToTypesense(client: Client, index: (offerTypeId: string, collection: Collection) => Promise<void>) {
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
		const aliasName = `offers_${offerTypeId}`
		try {
			const newCollectionName = createCollectionName(offerTypeId)
			await client.collections().create({
				name: newCollectionName,
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

			// Index into new collection
			const collection = await client.collections(newCollectionName)
			try {
				await retry(5, async () => {
					return await index(offerTypeId, collection)
				})
			} catch (e) {
				if (e && 'importResults' in e && Array.isArray(e.importResults)) {
					const failed = e.importResults.filter((it: unknown) => (typeof it != 'object') || !('success' in it) || !(it as {success: unknown}).success)
					console.log('failed import result: ', JSON.stringify(failed))
				}
				throw e
			}


			// Swap collections (alias)

			// Get old collection name
			let oldCollectionName: string | undefined
			try {
				const aliasSchema = await client.aliases(aliasName).retrieve()
				oldCollectionName = aliasSchema.collection_name
			} catch (e) {}

			// Delete old collection if alias not exists
			if (!oldCollectionName) {
				try {
					await client.collections(aliasName).delete()
				} catch (e) {}
			}

			// Create or swap alias
			await client.aliases().upsert(aliasName, { collection_name: newCollectionName })

			// Delete old collection
			if (oldCollectionName) {
				await client.collections(oldCollectionName).delete()
			}
		} catch (e) {
			console.error(`Error while indexing offer type ${offerTypeId}`, e)
		}
	}

	await clearCollection(client)
}

export async function clearCollection(client: Client) {
	const collections = await client.collections().retrieve()
	const allCollectionNames = collections.map(it => it.name)

	const aliases = await client.aliases().retrieve()
	const aliasesCollectionNames = aliases.aliases.map(it => it.collection_name)

	const unusedCollections = allCollectionNames.filter(it => !aliasesCollectionNames.includes(it))
	for (const unusedCollection of unusedCollections) {
		await client.collections(unusedCollection).delete()
	}
}

export function createCollectionName(offerTypeId: string) {
	const now = new Date()
	const randomString = Math.random().toString(36).substring(2, 15)
	return `offers_${offerTypeId}_${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}_${now.getHours()}_${now.getMinutes()}_${now.getSeconds()}_${randomString}`;
}
