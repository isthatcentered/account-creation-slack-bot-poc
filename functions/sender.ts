import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda"
import { parse } from "query-string"




export type Maybe<T> = T | null | undefined


interface Response
{
	headers?: { [ key: string ]: string }
	statusCode: number
	body?: string
}


const handler: Handler = ( event: APIGatewayEvent, context: Context, callback: Callback ): Promise<Response> => {
	
	const params = event.queryStringParameters,
	      body   = parse( event.body || "" ) as any
	
	
	console.log( "PARAMS:::", params )
	console.log( "BODY:::", body )
	
	
	return Promise.resolve( {
		statusCode: 200,
	} )
}

export { handler }