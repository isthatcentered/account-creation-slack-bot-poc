import { Maybe, slackEvent, userClickedAccountCreationButton, userSubmittedDialog } from "./contracts"
import { parse } from "query-string"




export function extractFormData( body: Maybe<string> ): slackEvent
{
	const { payload } = (parse( body || "payload=" ) as { payload: string })
	
	return JSON.parse( payload ) // payload return a json string even after parse
}