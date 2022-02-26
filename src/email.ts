import nodemailer from 'nodemailer'
import * as config from './config.js'

export type EmailPayload = {
	kind: "verification"
	verificationUrl: string
}

export type Email = {
	subject: string
	text: string
	html: string
}

const transport = nodemailer.createTransport({

	host: config.EMAIL_HOST,
	port: config.EMAIL_PORT,
	...(config.EMAIL_USER || config.EMAIL_PASSWORD ? {
		auth: {
			user: config.EMAIL_USER,
			pass: config.EMAIL_PASSWORD
		}
	} : {}),
})

type Templates = {
	[key in EmailPayload["kind"]]: (payload: EmailPayload) => Email
}

const templates: Templates = {
	verification: (payload: EmailPayload) => ({
		subject: "Verify your email",
		text: `
			Hello,

			Please verify your email by clicking the link below:

			${payload.verificationUrl}

			Thanks,
			The Team
		`,
		html: `
			<p>Hello,</p>

			<p>Please verify your email by clicking the link below:</p>

			<p><a href="${payload.verificationUrl}">${payload.verificationUrl}</a></p>

			<p>Thanks,</p>
			<p>The Team</p>
		`
	})
}


export const sendEmail = async (to: string, payload: EmailPayload) => {
	console.log(`Sending ${payload.kind} email to ${to}`)
	const email = templates[payload.kind](payload)
	await transport.sendMail({
		from: config.EMAIL_FROM,
		to,
		subject: email.subject,
		text: email.text,
		html: email.html,
	})
}
