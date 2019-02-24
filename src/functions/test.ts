// DOCS
// https://github.com/sw-yx/create-react-app-lambda-typescript/blob/master/src/lambda/hello.ts
// https://www.netlify.com/docs/cli/#unbundled-javascript-function-deploys

import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda"
import { parse } from "query-string"




export type Maybe<T> = T | null | undefined

interface SlachCommandRequest
{
	team_id: string
	team_domain: string
	channel_id: string
	channel_name: string
	user_id: string
	user_name: string
	command: string
	text: Maybe<string>
	response_url: string
	trigger_id: string
}

interface ImageBlock
{
	type: "image", // The type of block. For an image block, type is always image.
	image_url: string, // 	The URL of the image to be displayed.
	alt_text: string // A plain-text summary of the image. This should not contain any markup.
	title?: {
		type: "plain_text",
		text: string
		emoji?: boolean
	},
	block_id?: string,
}

interface Response
{
	headers: { [ key: string ]: string }
	statusCode: number
	body: string
}

const congrats = [
	"https://media.giphy.com/media/g9582DNuQppxC/giphy.gif",
	"https://media.giphy.com/media/3oriO75X3EdbWwBqIo/giphy.gif",
	"https://media.giphy.com/media/bKBM7H63PIykM/giphy.gif",
]

const handler: Handler = ( event: APIGatewayEvent, context: Context, callback: Callback ): Promise<Response> => {
	
	const params                    = event.queryStringParameters,
	      body: SlachCommandRequest = parse( event.body || "" ) as any
	
	const imageBlock: ImageBlock = {
		type:      "image",
		title:     {
			type:  "plain_text",
			text:  "🥳",
			emoji: true,
		},
		image_url: "https://media.giphy.com/media/bKBM7H63PIykM/giphy.gif",
		alt_text:  "Congrats",
	}
	
	return Promise.resolve( {
		headers:    {
			"Content-Type": "application/json",
		},
		statusCode: 200,
		body:       JSON.stringify( {
			blocks: [
				imageBlock,
			],
		} ),
	} )
}

export { handler }