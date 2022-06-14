import { sendVerifications } from "./sendVerifications.js"
import { sendReactionVerifications } from "./sendReactionVerifications.js"
import { sendReactions } from "./sendReactions.js"
import { indexToTypesense } from "./indexSearch.js"
import { indexToTypesensePublic } from "./indexSearchPublic.js"
import { TYPESENSE_HOST, TYPESENSE_HOST_PUBLIC } from "./config.js"
import { translateParameter } from './translateParameter.js'
import { translateParameterValue } from './translateParameterValue.js'

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

		if (i % 70 === 0 && TYPESENSE_HOST_PUBLIC) { // 6 minutes
			console.log("Indexing to typesense public")
			await indexToTypesensePublic()
		}

		if (i % 200 === 0) { // 16 minutes
			console.log("Translating...")
			await translateParameter()
		}
		if (i % 210 === 0) { // 17 minutes
			console.log("Translating...")
			await translateParameterValue()
		}

		// if (i % 220 === 0) { // some minutes
		// 	console.log("Translating values...")
		// 	await translateValues()
		// }

		// if (i % 2 === 0) { // Every 10 seconds
		// 	console.log("Translating parameter values...")
		// 	await translateParameter()
		// }

		// if (i % 3 === 0) { // Every 15 seconds
		// 	console.log("Translating parameter specifications...")
		// 	await translateParameterSpec()
		// }


		i++

		await sleep(5000)
	}
}

main()
