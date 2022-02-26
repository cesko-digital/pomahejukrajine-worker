import {sendVerifications} from "./sendVerifications.js";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));


async function main() {
	while (true) {
		console.log("Sending verifications...");
		await sendVerifications()
		await sleep(5000)
	}
}

main()
