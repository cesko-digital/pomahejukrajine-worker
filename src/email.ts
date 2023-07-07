import fetch from "node-fetch"
import * as config from './config.js'

type Payloads = {
	verification: {
		verificationUrl: string
		verificationUrlUk: string
	}
	reactionVerification: {
		verificationUrl: string
		verificationUrlUk: string
	}
	reaction: {
		offerTypeName: string
		email: string
		phone: string
		text?: string
	}
}

export type Email = {
	subject: string
	text: string
	html: string
}

type Templates = {
	[key in keyof Payloads]: (payload: Payloads[key]) => Email
}

const templates: Templates = {
	verification: (payload) => ({
		subject: "Pomáhej Ukrajině - ověření emailu",
		text: `
			Dobrý den,

			děkujeme za nabídku pomoci. Prosíme vás o potvrzení vašeho emailu kliknutím na odkaz níže a následně nastavení hesla.

			${payload.verificationUrl}

			Děkujeme!
			Tým Pomáhej Ukrajině

			-----

			Доброго дня,

			дякуємо за пропозицію допомоги. Будь ласка, підтвердьте свою електронну пошту, натиснувши посилання нижче а потім встановіть пароль.

			${payload.verificationUrlUk}

			Дякуємо!
			Колектив Допомагай Україні
		`,
		html: `
			<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
			<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

			<head>
			<!--[if gte mso 9]>
			<xml>
			<o:OfficeDocumentSettings>
				<o:AllowPNG/>
				<o:PixelsPerInch>96</o:PixelsPerInch>
			</o:OfficeDocumentSettings>
			</xml>
			<![endif]-->
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta name="x-apple-disable-message-reformatting">
			<!--[if !mso]><!-->
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<!--<![endif]-->
			<title></title>
			</head>

			<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
			<!--[if IE]><div class="ie-container"><![endif]-->
			<!--[if mso]><div class="mso-container"><![endif]-->
			<table
				style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
				cellpadding="0" cellspacing="0">
				<tbody>
				<tr style="vertical-align: top">
					<td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
					<!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->


					<div class="u-row-container" style="padding: 0px;background-color: transparent">
						<div class="u-row"
						style="Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
						<div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
							<!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]-->

							<!--[if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
							<div class="u-col u-col-100" style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
							<div style="width: 100% !important;">
								<!--[if (!mso)&(!IE)]><!-->
								<div
								style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
								<!--<![endif]-->

								<table style="font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;" role="presentation" cellpadding="0" cellspacing="0"
									width="100%" border="0">
									<tbody>
									<tr>
										<td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;"
										align="left">

										<div>
											<h1 style="font-size: 3.75rem; line-height: 1; --tw-text-opacity: 1;color: rgb(17 24 39/var(--tw-text-opacity));">Pomáhej Ukrajině</h1>
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity));font-size: 1.25rem; line-height: 1.75rem;">Dobrý den,</p>

											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity)); font-size: 1.25rem; line-height: 1.75rem;">děkujeme za nabídku pomoci. Prosíme vás o potvrzení vašeho emailu kliknutím na odkaz níže a následně
											nastavení hesla.</p>

											<p><a style="color: #b61a3b;text-decoration: none;font-weight: bold;font-size: 1.25rem; line-height: 1.75rem;" href="${payload.verificationUrl}">${payload.verificationUrl}</a></p>

											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity));font-size: 1.25rem; line-height: 1.75rem;">Děkujeme!</p>
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity));font-size: 1.25rem; line-height: 1.75rem;">Tým Pomáhej Ukrajině</p>
										</div>

										<div style="margin-top: 50px;">
											<h1 style="font-size: 3.75rem; line-height: 1; --tw-text-opacity: 1;color: rgb(17 24 39/var(--tw-text-opacity));">Допомагай Україні</h1>
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity));font-size: 1.25rem; line-height: 1.75rem;">Доброго дня,</p>

											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity)); font-size: 1.25rem; line-height: 1.75rem;">дякуємо за пропозицію допомоги. Будь ласка, підтвердьте свою електронну пошту, натиснувши посилання нижче а потім встановіть пароль.</p>

											<p><a style="color: #b61a3b;text-decoration: none;font-weight: bold;font-size: 1.25rem; line-height: 1.75rem;" href="${payload.verificationUrlUk}">${payload.verificationUrlUk}</a></p>
											<br />
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity));font-size: 1.25rem; line-height: 1.75rem;">Дякуємо!</p>
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity));font-size: 1.25rem; line-height: 1.75rem;">Колектив Допомагай Україні</p>
										</div>

										</td>
									</tr>
									</tbody>
								</table>

								<!--[if (!mso)&(!IE)]><!-->
								</div>
								<!--<![endif]-->
							</div>
							</div>
							<!--[if (mso)|(IE)]></td><![endif]-->
							<!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
						</div>
						</div>
					</div>


					<!--[if (mso)|(IE)]></td></tr></table><![endif]-->
					</td>
				</tr>
				</tbody>
			</table>
			<!--[if mso]></div><![endif]-->
			<!--[if IE]></div><![endif]-->
			</body>

			</html>
		`
	}),
	reactionVerification: (payload) => ({
		subject: "Pomáhej Ukrajině - ověření emailu",
		text: `
			Dobrý den,

			pro předání kontaktu člověku, který nabízí pomoc, Vás prosíme o potvrzení vašeho emailu. Stačí kliknout na odkaz níže:

			${payload.verificationUrl}

			Děkujeme!
			Tým Pomáhej Ukrajině

			-----

			Доброго дня,

			для передачі контактних даних людині, яка пропонує допомогу, будь ласка підтвердьте ваш е-мейл. Просто натисніть посилання нижче:

			${payload.verificationUrlUk}

			Дякуємо!
			Колектив Допомагай Україні
		`,
		html: `
		<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
		<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

		<head>
		<!--[if gte mso 9]>
		<xml>
		<o:OfficeDocumentSettings>
			<o:AllowPNG/>
			<o:PixelsPerInch>96</o:PixelsPerInch>
		</o:OfficeDocumentSettings>
		</xml>
		<![endif]-->
		<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<meta name="x-apple-disable-message-reformatting">
		<!--[if !mso]><!-->
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<!--<![endif]-->
		<title></title>
		</head>

		<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
		<!--[if IE]><div class="ie-container"><![endif]-->
		<!--[if mso]><div class="mso-container"><![endif]-->
		<table
			style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;max-width: 1200px;Margin: 0 auto;background-color: #ffffff;width:100%"
			cellpadding="0" cellspacing="0">
			<tbody>
			<tr style="vertical-align: top">
				<td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
				<!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->


				<div class="u-row-container" style="padding: 0px;background-color: transparent">
					<div class="u-row"
					style="Margin: 0 auto;min-width: 320px;max-width: 1200px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
					<div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
						<!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:1200px;"><tr style="background-color: transparent;"><![endif]-->

						<!--[if (mso)|(IE)]><td align="center" width="1200" style="width: 1200px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
						<div class="u-col u-col-100" style="min-width: 320px;max-width: 1200px;display: table-cell;vertical-align: top;">
						<div style="width: 100% !important;">
							<!--[if (!mso)&(!IE)]><!-->
							<div
							style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
							<!--<![endif]-->

							<table style="font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;" role="presentation" cellpadding="0" cellspacing="0"
								width="100%" border="0">
								<tbody>
								<tr>
									<td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;"
									align="left">

									<div>
										<h1 style="font-size: 3.75rem; line-height: 1; --tw-text-opacity: 1;">Pomáhej Ukrajině</h1>
										<p style="--tw-text-opacity: 1;font-size: 1.25rem; line-height: 1.75rem;">Dobrý den,</p>

										<p style="--tw-text-opacity: 1; font-size: 1.25rem; line-height: 1.75rem;">pro předání kontaktu člověku, který nabízí pomoc, Vás prosíme o potvrzení vašeho emailu. Stačí kliknout na odkaz níže:</p>

										<p><a style="color: #005BBB;text-decoration: none;font-weight: bold;font-size: 1.25rem; line-height: 1.75rem;" href="${payload.verificationUrl}">${payload.verificationUrl}</a></p>

										<p style="--tw-text-opacity: 1;font-size: 1.25rem; line-height: 1.75rem;">Děkujeme!</p>
										<p style="--tw-text-opacity: 1;font-size: 1.rem; line-height: 1.5rem;">Tým Pomáhej Ukrajině</p>
									</div>

									<div style="margin-top: 50px;">
										<h1 style="font-size: 3.75rem; line-height: 1; --tw-text-opacity: 1;">Допомагай Україні</h1>
										<p style="--tw-text-opacity: 1;font-size: 1.25rem; line-height: 1.75rem;">Доброго дня,</p>

										<p style="--tw-text-opacity: 1;font-size: 1.25rem; line-height: 1.75rem;">для передачі контактних даних людині, яка пропонує допомогу, будь ласка підтвердьте ваш е-мейл. Просто натисніть посилання нижче:</p>

										<p><a style="color: #005BBB;text-decoration: none;font-weight: bold;font-size: 1.25rem; line-height: 1.75rem;" href="${payload.verificationUrlUk}">${payload.verificationUrlUk}</a></p>

										<p style="--tw-text-opacity: 1;font-size: 1.25rem; line-height: 1.75rem;">Дякуємо!</p>
										<p style="--tw-text-opacity: 1;font-size: 1.rem; line-height: 1.5rem;">Колектив Допомагай Україні</p>
									</div>

									</td>
								</tr>
								</tbody>
							</table>

							<!--[if (!mso)&(!IE)]><!-->
							</div>
							<!--<![endif]-->
						</div>
						</div>
						<!--[if (mso)|(IE)]></td><![endif]-->
						<!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
					</div>
					</div>
				</div>


				<!--[if (mso)|(IE)]></td></tr></table><![endif]-->
				</td>
			</tr>
			</tbody>
		</table>
		<!--[if mso]></div><![endif]-->
		<!--[if IE]></div><![endif]-->
		</body>

		</html>
		`
	}),
	reaction: (payload) => ({
		subject: "Pomáhej Ukrajině - poptávka po vámi nabízené pomoci",
		text: `
			Dobrý den,

			máme poptávku po vámi nabízené pomoci v kategorii ${payload.offerTypeName}.

			Kontaktní údaje na člověka poptávajícího vaši pomoc:

			${payload.email}

			${!payload.phone ? '' : `Telefon: ${payload.phone}`}

			${!payload.text ? '' : `Zpráva: ${payload.text}`}

			Upozornění: objevily se snahy získat podvodně finance od dobrovolníků, nabízejících materiální pomoc. Na žádosti o finanční podporu prosím nereagujte.

			Děkujeme!
			Tým Pomáhej Ukrajině
		`,
		html: `
		<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
			<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">

			<head>
			<!--[if gte mso 9]>
			<xml>
			<o:OfficeDocumentSettings>
				<o:AllowPNG/>
				<o:PixelsPerInch>96</o:PixelsPerInch>
			</o:OfficeDocumentSettings>
			</xml>
			<![endif]-->
			<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<meta name="x-apple-disable-message-reformatting">
			<!--[if !mso]><!-->
			<meta http-equiv="X-UA-Compatible" content="IE=edge">
			<!--<![endif]-->
			<title></title>
			</head>

			<body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
			<!--[if IE]><div class="ie-container"><![endif]-->
			<!--[if mso]><div class="mso-container"><![endif]-->
			<table
				style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%"
				cellpadding="0" cellspacing="0">
				<tbody>
				<tr style="vertical-align: top">
					<td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
					<!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #e7e7e7;"><![endif]-->


					<div class="u-row-container" style="padding: 0px;background-color: transparent">
						<div class="u-row"
						style="Margin: 0 auto;min-width: 320px;max-width: 500px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: transparent;">
						<div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
							<!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:500px;"><tr style="background-color: transparent;"><![endif]-->

							<!--[if (mso)|(IE)]><td align="center" width="500" style="width: 500px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
							<div class="u-col u-col-100" style="max-width: 320px;min-width: 500px;display: table-cell;vertical-align: top;">
							<div style="width: 100% !important;">
								<!--[if (!mso)&(!IE)]><!-->
								<div
								style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;">
								<!--<![endif]-->

								<table style="font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;" role="presentation" cellpadding="0" cellspacing="0"
									width="100%" border="0">
									<tbody>
									<tr>
										<td style="overflow-wrap:break-word;word-break:break-word;padding:10px;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;"
										align="left">

										<div>
											<h1 style="font-size: 3.75rem; line-height: 1; --tw-text-opacity: 1;color: rgb(17 24 39/var(--tw-text-opacity));">Pomáhej Ukrajině</h1>
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity));font-size: 1.25rem; line-height: 1.75rem;">Dobrý den,</p>

											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity)); font-size: 1.25rem; line-height: 1.75rem;">máme poptávku po vámi nabízené pomoci v kategorii ${payload.offerTypeName}.</p>
											<br />
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity)); font-size: 1.25rem; line-height: 1.75rem;">Kontaktní údaje na člověka poptávajícího vaši pomoc:</p>

											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity)); font-size: 1.25rem; line-height: 1.75rem;">E-mail: ${payload.email}</p>

											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity)); font-size: 1.25rem; line-height: 1.75rem;">Telefon: ${!payload.phone ? 'Nevyplněn' : `${payload.phone}`}</p>

											${payload.text ? `<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity)); font-size: 1.25rem; line-height: 1.75rem;">Zpráva:<br />${payload.text.replace(/(?:\r\n|\r|\n)/g, '<br />')}</p>` : ''}
											<br />
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity)); font-size: 1.25rem; line-height: 1.75rem;">Upozornění: objevily se snahy získat podvodně finance od dobrovolníků, nabízejících materiální pomoc. Na žádosti o finanční podporu prosím nereagujte.</p>
											<br />
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity));font-size: 1.25rem; line-height: 1.75rem;">Děkujeme!</p>
											<p style="--tw-text-opacity: 1; color: rgb(107 114 128/var(--tw-text-opacity));font-size: 1.25rem; line-height: 1.75rem;">Tým Pomáhej Ukrajině</p>
										</div>

										</td>
									</tr>
									</tbody>
								</table>

								<!--[if (!mso)&(!IE)]><!-->
								</div>
								<!--<![endif]-->
							</div>
							</div>
							<!--[if (mso)|(IE)]></td><![endif]-->
							<!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
						</div>
						</div>
					</div>


					<!--[if (mso)|(IE)]></td></tr></table><![endif]-->
					</td>
				</tr>
				</tbody>
			</table>
			<!--[if mso]></div><![endif]-->
			<!--[if IE]></div><![endif]-->
			</body>

			</html>
		`,
	}),
}

export const sendEmail = async <T extends keyof Payloads>(to: string, kind: T, payload: Payloads[T]) => {
	console.log(`Sender: Sending ${kind} email to ${to}`);
	const email = templates[kind](payload as any);
	const response = await fetch('https://api2.ecomailapp.cz/transactional/send-message', {
			method: 'POST',
			headers: {
					'Content-Type': 'application/json',
					'key': config.API_KEY,
			},
			body: JSON.stringify({
					"message": {
							"subject": email.subject,
							"from_name": "Pomáhej Ukrajině (automatický mail, neodpovídejte)",
							"from_email": config.EMAIL_FROM,
							"text": email.text,
							"html": email.html,
							"to": [
									{
											"email": to,
											"bcc": config.EMAIL_BCC
									}
							],
							"options": {
									"click_tracking": false,
									"open_tracking": false
							}
					}
			})
	});

	if (response.ok) {
			const responseBody = await response.json();
			console.log('Status:', response.status);
			console.log('Headers:', JSON.stringify(response.headers));
			console.log('Response:', responseBody);
	} else {
			console.error(`HTTP error! status: ${response.status}`);
	}
}
