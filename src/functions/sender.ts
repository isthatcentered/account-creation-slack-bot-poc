import { APIGatewayEvent, Callback, Context } from "aws-lambda"
import { config } from "dotenv"
import { LogLevel, WebClient } from "@slack/client"
import { Response, userClickedAccountCreationButton, userSubmittedDialog } from "../contracts"
import { extractFormData } from "../utilities"
import { makeEventHandler } from "../accountCreationHandlers"




config()


type accountCreationRequestEvents = userClickedAccountCreationButton | userSubmittedDialog

const handler = ( req: APIGatewayEvent, context: Context, callback: Callback ): Promise<Response> => {
	
	const client = new WebClient( process.env.SLACK_TOKEN, { logLevel: LogLevel.DEBUG } ),
	      event  = extractFormData( req.body )
	
	return makeEventHandler( event as accountCreationRequestEvents, client ).handle()
}



export { handler }