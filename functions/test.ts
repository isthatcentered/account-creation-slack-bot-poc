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



// token=ofejdTf2assfTdvTYIwl88za
// team_id=T4R6RCZFA
// team_domain=adeo-tech-community
// channel_id=GG4HB63KM
// channel_name=privategroup
// user_id=UDVSGT3EW
// user_name=edouard.penin
// command=%2Fcongrats
// text=
// response_url=https%3A%2F%2Fhooks.slack.com%2Fcommands%2FT4R6RCZFA%2F558793207363%2FO0Rkh7ewtb1gz8QYjhvelzps
// trigger_id=558167186192.161229441520.3b717ebc8cf4d8d2aa2e0bdc2d930596

interface SlachCommandBody
{

}

interface HelloResponse
{
	statusCode: number
	body: string
}

const handler: Handler = ( event: APIGatewayEvent, context: Context, callback: Callback ) => {
	
	const params = event.queryStringParameters,
	      body   = event.body
	
	
	console.log( "BODY:::", body )
	console.log( "PARAMS:::", params )
	console.log( event )
	
	
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