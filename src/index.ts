import {processActions} from "./processActions.js";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
	// noinspection InfiniteLoopJS
	while (true) {
		await processActions()
		await sleep(5000)
	}
}

// noinspection JSIgnoredPromiseFromCall
main()
