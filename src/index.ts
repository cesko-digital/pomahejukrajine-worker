import {sendVerifications} from "./sendVerifications.js";
import {sendReactionVerifications} from "./sendReactionVerifications";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


async function main() {
	while (true) {
		console.log("Sending volunteer verifications...");
		await sendVerifications()
		console.log("Sending reaction verifications...");
		await sendReactionVerifications()
		await sleep(5000)
	}
}

main()
