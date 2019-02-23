import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda"
import { parse } from "query-string"
import { WebClient } from "@slack/client"




export type Maybe<T> = T | null | undefined


interface Response
{
	headers?: { [ key: string ]: string }
	statusCode: number
	body?: string
}


interface MessageActionRequest
{
	payload: {
		type: string
		token: string
		action_ts: string
		team: {
			domain: string
			id: string
		}
		user: {
			name: string
			id: string
		}
		channel: {
			name: string
			id: string
		}
		callback_id: string
		trigger_id: string
		message_ts: string
		message: {
			client_msg_id?: string
			text: string
			type: string
			user?: string
			ts: string
			username?: string
			subtype?: string
			bot_id?: string
		}
		response_url: string
	}
}

const handler: Handler = ( event: APIGatewayEvent, context: Context, callback: Callback ): Promise<Response> => {
	
	const params                     = event.queryStringParameters,
	      body: MessageActionRequest = parse( event.body || "" ) as any
	
	
	console.log( "PARAMS:::", params )
	console.log( "BODY:::", body )
	
	const web = new WebClient( "xoxp-560384344470-558908103412-558913681364-094288a8b62ce5e2f1a3f8b98ebb684a" )
	
	return web.auth
		.test()
		.then( ( res: any ) => {
			console.log( "RES:::", res )
			return res.user_id // Find your user id to know where to send messages to
		} )
		.then( id => {
			
			const promises = [
				web.chat.postMessage( {
					channel: "CGEU070CA",
					text:    `The current time is... now ? 🤷‍♂️`,
				} ),
				web.dialog.open( {
					trigger_id: body.payload.trigger_id,
					dialog:     {
						callback_id:      "ryde-46e2b0",
						title:            "Request a Ride",
						submit_label:     "Request",
						notify_on_cancel: true,
						state:            "Limo",
						elements:         [
							{
								type:  "text",
								label: "Pickup Location",
								name:  "loc_origin",
							},
							{
								type:  "text",
								label: "Dropoff Location",
								name:  "loc_destination",
							},
						],
					},
				} ),
			]
			return Promise.all( promises )
		} )
		.then( () =>
			({
				headers:    {
					"Content-Type": "application/json",
				},
				statusCode: 200,
				body:       JSON.stringify( {
					message: "Hello 😍",
				} ),
			}) )
		.catch( err =>
			({
				headers:    {
					"Content-Type": "application/json",
				},
				statusCode: 500,
				body:       JSON.stringify( err ),
			}) )
}

const payload: MessageActionRequest = {
	payload: {
		type:         "message_action",
		token:        "KmDISxAGBBgfNVS3f12ILd2a",
		action_ts:    "1550919892.981365",
		team:         {
			id:     "TGGBAA4DU",
			domain: "isthatcenteredgroup",
		},
		user:         {
			id:   "UGESQ31C4",
			name: "e.peninb",
		},
		channel:      {
			id:   "CGEU070CA",
			name: "factory",
		},
		callback_id:  "account_new",
		trigger_id:   "558921874852.560384344470.10ba386f94dda67100c50da433c85949",
		message_ts:   "1550918636.000300",
		message:      {
			type:     "message",
			subtype:  "bot_message",
			text:     "The current time is... now ? :man-shrugging:",
			ts:       "1550918636.000300",
			username: "Random",
			bot_id:   "BGEQKNVNX",
		},
		response_url: "https:\\/\\/hooks.slack.com\\/app\\/TGGBAA4DU\\/558217982864\\/uioZZFM70Dm93kXJirK1j3uM",
	},
}

const payload2: MessageActionRequest = {
	payload: {
		type:         "message_action",
		token:        "KmDISxAGBBgfNVS3f12ILd2a",
		action_ts:    "1550924311.855212",
		team:         {
			id:     "TGGBAA4DU",
			domain: "isthatcenteredgroup",
		},
		user:         {
			id:   "UGESQ31C4",
			name: "e.peninb",
		},
		channel:      {
			id:   "CGEU070CA",
			name: "factory",
		},
		callback_id:  "account_new",
		trigger_id:   "558941468132.560384344470.3ffaaa71fb62b5f5fd03c1225accaec0",
		message_ts:   "1550924309.000500",
		message:      {
			client_msg_id: "34819af8-f04e-4c56-8f80-96f38a355162",
			type:          "message",
			text:          "lmklj",
			user:          "UGESQ31C4",
			ts:            "1550924309.000500",
		},
		response_url: "https:\\/\\/hooks.slack.com\\/app\\/TGGBAA4DU\\/558985554802\\/iPWhWQI5qrh0BfzZwEkGUL1p",
	},
}


export { handler }