import { processActions } from "./index.js";
import { checkRequiredEnvVars } from "./requiredEnvVars.js";

console.log("S T A G I N G   S C R I P T S")

await checkRequiredEnvVars()

console.time("processActions")

await processActions()

console.timeEnd("processActions")
