console.log("S T A G I N G   S C R I P T S")

console.log(JSON.stringify({
    CONTEMBER_CONTENT_URL: process.env.CONTEMBER_CONTENT_URL,
    CONTEMBER_TENANT_URL: process.env.CONTEMBER_TENANT_URL,
    CONTEMBER_TOKEN: process.env.CONTEMBER_TOKEN,
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    FRONTEND_URL: process.env.FRONTEND_URL,
}, null, 4))
