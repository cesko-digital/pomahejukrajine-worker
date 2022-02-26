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
		subject: "Pomozme Ukrajině - ověření emailu",
		text: `
			Dobrý den,

			děkujeme za nabídku pomoci. Prosíme vás o potvrzení vašeho emailu kliknutím na odkaz níže a následně nastavení hesla.

			${payload.verificationUrl}

			Děkujeme!
			Tým Pomozme Ukrajině
		`,
		html: `
			<p>Dobrý den,</p>

			<p>děkujeme za nabídku pomoci. Prosíme vás o potvrzení vašeho emailu kliknutím na odkaz níže a následně nastavení hesla.</p>

			<p><a href="${payload.verificationUrl}">${payload.verificationUrl}</a></p>

			<p>Děkujeme!</p>
			<p>Tým Pomozme Ukrajině</p>
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
