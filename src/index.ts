import { sendVerifications } from "./sendVerifications.js"
import { sendReactionVerifications } from "./sendReactionVerifications.js"
import { sendReactions } from "./sendReactions.js"
import { indexToTypesense } from "./indexSearch.js"
import { indexToTypesensePublic } from "./indexSearchPublic.js"
import { TYPESENSE_HOST, TYPESENSE_HOST_PUBLIC } from "./config.js"
import { translate } from "./translate.js"
import { translateValues } from "./translateValues.js"

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

		if (i % 60 === 0 && TYPESENSE_HOST) { // 5 minutes
			console.log("Indexing to typesense")
			await indexToTypesense()
		}

		if (i % 70 === 0 && TYPESENSE_HOST_PUBLIC) { // 5 minutes
			console.log("Indexing to typesense public")
			await indexToTypesensePublic()
		}

		if (i % 200 === 0 && TYPESENSE_HOST_PUBLIC) { // 16 minutes
			console.log("Translating...")
			await translate()
		}

		console.log("Translating values...")
		await translateValues()

		i++

		await sleep(5000)
	}
}

main()
