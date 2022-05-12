import fetch from "node-fetch";
import { XMLHttpRequest } from "xmlhttprequest";
import {
	CONTEMBER_CONTENT_URL,
	CONTEMBER_TOKEN,
} from "./config.js";

export async function translateStuff() {
    const response = await fetch(CONTEMBER_CONTENT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONTEMBER_TOKEN}`,
        },
        body: JSON.stringify({
            query: `
							query {
								listOfferParameterValue(
									filter: {
										specification: { isNull: false }
										and: { specificationUK: { isNull: true } }
									},
									limit: 1
								) {
									id
									specification
								}
							}
						`,
        }),
    });
    const thingsToTranslate = (await response.json() as any)?.data?.listOfferParameterValue;
    console.log(thingsToTranslate);
    if (!thingsToTranslate) {
        throw new Error('Error while fetching stuff to translate');
    }
    for (const thingToTranslate of thingsToTranslate) {
        const thingToTranslateId = thingToTranslate.id;
        const thingToTranslateValue = thingToTranslate.specification;
        try {
						const data = "input_text=" + thingToTranslateValue;

						const xhr = new XMLHttpRequest();
						xhr.withCredentials = true;

						xhr.addEventListener("readystatechange", function () {
							if (this.readyState === this.DONE) {
								let response = JSON.parse(this.responseText);
								response.forEach(function (item : string) {
									saveTranslation(item, thingToTranslateId);
								});
							}
						});

						xhr.open("POST", "https://lindat.cz/translation/api/v2/languages/?src=cs&tgt=uk&logInput=true&author=PomahejUkrajine");
						xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
						xhr.setRequestHeader("Accept", "application/json");
						xhr.send(data);
        }
        catch (e) {
            console.error(`Error while translating ${thingToTranslateId}`, e);
        }
    }
}

const saveTranslation = async (translation: String, translationID: String) => {
	const response = await fetch(
		CONTEMBER_CONTENT_URL,
		{
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${CONTEMBER_TOKEN}`,
			},
			body: JSON.stringify({
				query: `
					mutation($data: String, $id: UUID!) {
						updateOfferParameterValue(
							by: { id: $id }
							data: {
								specificationUK: $data
							}
						) {
							ok
							errorMessage
						}
					}
				`,
				variables: {
					data: translation,
					id: translationID,
				},
			}),
		}
	)

	if (!response.ok) {
		throw new Error(`Failed to save translation: ${response.statusText}`)
	}
}
