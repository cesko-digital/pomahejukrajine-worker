const requiredEnvVars = [
    "CONTEMBER_CONTENT_URL",
    "CONTEMBER_TENANT_URL",
    "CONTEMBER_TOKEN",
    "EMAIL_HOST",
    "EMAIL_PORT",
    "EMAIL_USER",
    "EMAIL_PASSWORD",
    "EMAIL_FROM",
    "FRONTEND_URL",
]

export const checkRequiredEnvVars = (): void => {
    for (let requiredEnvVar of requiredEnvVars)
        if (!process.env[requiredEnvVar])
            throw new Error(`Missing required environment variable "${requiredEnvVar}"`)
}
