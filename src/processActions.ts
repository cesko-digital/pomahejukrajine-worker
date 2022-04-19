import { sendVerifications } from "./sendVerifications.js";
import { sendReactionVerifications } from "./sendReactionVerifications.js";
import { sendReactions } from "./sendReactions.js";

export async function processActions() {
	console.log("Sending volunteer verifications...")
	await sendVerifications()
	console.log("Sending reaction verifications...")
	await sendReactionVerifications()
	console.log("Sending reactions...")
	await sendReactions()
}
