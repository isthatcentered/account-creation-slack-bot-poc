// DOCS
// https://github.com/sw-yx/create-react-app-lambda-typescript/blob/master/src/lambda/hello.ts
// https://www.netlify.com/docs/cli/#unbundled-javascript-function-deploys

// const axios = require( "axios" )
//
// // deploys to {whatever}.netlify.com/.netlify/functions/test
//
// exports.handler = async ( event, context, callback ) => {
//
// 	console.log( "EVENT:::", event )
// 	console.log( "CONTEXT:::", context )
//
// 	try {
//
// 		const data = await axios( "https://api.chucknorris.io/jokes/random" )
// 			.then( res => res.data )
//
// 		return {
// 			statusCode: 200,
// 			headers: { "Content-Type": "application/json" },
// 			body: JSON.stringify( data ),
// 		}
// 	} catch ( e ) {
//
// 		return {
// 			statusCode: 500,
// 			headers: { "Content-Type": "application/json" },
// 			body: JSON.stringify( e ),
// 		}
// 	}
// }

import { APIGatewayEvent, Callback, Context, Handler } from "aws-lambda"




interface HelloResponse
{
	statusCode: number
	body: string
}

const handler: Handler = ( event: APIGatewayEvent, context: Context, callback: Callback ) => {
	
	const params = event.queryStringParameters,
	      body   = event.body
	
	console.log( body )
	
	const response: HelloResponse = {
		statusCode: 200,
		body:       JSON.stringify( {
			msg: `Hello world ${Math.floor( Math.random() * 10 )}`,
			params,
		} ),
	}
	
	callback( undefined, response )
}

export { handler }