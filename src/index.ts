import { sendVerifications } from "./sendVerifications.js"
import { sendReactionVerifications } from "./sendReactionVerifications.js"
import { sendReactions } from "./sendReactions.js"
import { indexToTypesense } from "./indexSearch.js"
import { indexToTypesensePublic } from "./indexSearchPublic.js"
import { TYPESENSE_HOST, TYPESENSE_HOST_PUBLIC } from "./config.js"
import { translateParameters } from './translateParameters.js'
import { generateOfferCodes }  from './generateOfferCodes.js';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))


async function main() {
	let i = 0

	while (true) {
		console.log("Sending volunteer verifications...")
		await sendVerifications()

		console.log("Sending reaction verifications...")
		await sendReactionVerifications()

		console.log("Sending reactions...")
		await sendReactions()

		if (i % 200 === 0 && TYPESENSE_HOST) { // 16 minutes
			console.log("Indexing to typesense")
			await indexToTypesense()
		}

		if (i % 210 === 0 && TYPESENSE_HOST_PUBLIC) { // 17 minutes
			console.log("Indexing to typesense public")
			await indexToTypesensePublic()
		}

		if (i % 50 === 0) { // 10 seconds
			console.log("Translating...")
			await translateParameters('OfferParameter')
		}
		if (i % 60 === 0) { // 25 seconds
			console.log("Translating...")
			await translateParameters('OfferParameterValue')
		}
		if (i % 60 === 0) { // 25 seconds
			console.log("Generating offer codes...")
			await generateOfferCodes()
		}

		i++

		await sleep(5000)
	}
}

main()
