import {sendVerifications} from "./sendVerifications.js";
import {sendReactionVerifications} from "./sendReactionVerifications.js";
import {sendReactions} from "./sendReactions.js";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


async function main() {
	while (true) {
		console.log("Sending volunteer verifications...");
		await sendVerifications()
		console.log("Sending reaction verifications...");
		await sendReactionVerifications()
		console.log("Sending reactions...");
		await sendReactions()
		await sleep(5000)
	}
}

main()
